// AI explanation engine (PRD §14, FR-019..023).
//
// Two modes:
//  1. Remote: if a compatible LLM endpoint is configured at runtime
//     (window.__LABVIVID_AI__ = { endpoint, apiKey?, model? }), the request is
//     sent there with a grounded prompt. Non-blocking from the sim loop.
//  2. Local fallback: a deterministic, state-grounded explainer that never
//     fabricates values — it only references the computed results it is given.
//
// Either way the explanation is grounded in the current model state and never
// claims to run calculations beyond the provided values (FR-021, §14.2).

import type { ModelDefinition, Variables, ComputeResult } from '../types/model';
import type { Lang } from '../i18n';

export interface ExplainInput {
  model: ModelDefinition;
  vars: Variables;
  computed: ComputeResult;
  question: string;
  lang: Lang;
}

interface RemoteConfig {
  endpoint: string;
  apiKey?: string;
  model?: string;
}

declare global {
  interface Window {
    __LABVIVID_AI__?: RemoteConfig;
  }
}

function fmt(v: number | string, precision = 2): string {
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : v.toFixed(precision);
  }
  return String(v);
}

/** Build the grounded prompt shape from PRD §14.3. */
export function buildPrompt(input: ExplainInput): string {
  const { model, vars, computed, question, lang } = input;
  const level = model.meta.difficulty;
  const params = Object.entries(vars)
    .map(([k, v]) => `- ${k}: ${fmt(v as number)}`)
    .join('\n');
  const results = computed.data
    .map((d) => `- ${d.label}: ${fmt(d.value, d.precision)}${d.unit ? ' ' + d.unit : ''}`)
    .join('\n');
  const concepts = (lang === 'zh' ? model.conceptsZh : model.concepts).join('; ');
  return [
    `You are a science tutor. Explain the current simulation state to a student.`,
    `Respond in ${lang === 'zh' ? 'Chinese' : 'English'}.`,
    ``,
    `Model: ${lang === 'zh' ? model.meta.titleZh : model.meta.title}`,
    `Level: ${level}`,
    `Concept notes: ${concepts}`,
    ``,
    `Parameters:`,
    params,
    ``,
    `Calculated results:`,
    results,
    ``,
    `User question:`,
    question || 'Explain what is happening in this simulation.',
    ``,
    `Answer clearly, briefly, and grounded in the provided simulation state. Do not invent values that are not listed above.`,
  ].join('\n');
}

async function explainRemote(input: ExplainInput, cfg: RemoteConfig): Promise<string> {
  const prompt = buildPrompt(input);
  const res = await fetch(cfg.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: cfg.model ?? 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
    }),
  });
  if (!res.ok) throw new Error(`AI endpoint error ${res.status}`);
  const data = await res.json();
  const text =
    data?.choices?.[0]?.message?.content ??
    data?.content?.[0]?.text ??
    data?.text;
  if (!text) throw new Error('Empty AI response');
  return String(text).trim();
}

// ---- Local grounded fallback ------------------------------------------------

function valueOf(computed: ComputeResult, key: string): string | undefined {
  const d = computed.data.find((x) => x.key === key);
  if (!d) return undefined;
  return `${fmt(d.value, d.precision)}${d.unit ? ' ' + d.unit : ''}`;
}

function localExplain(input: ExplainInput): string {
  const { model, vars, computed, question, lang } = input;
  const q = question.toLowerCase();
  const zh = lang === 'zh';
  const lines: string[] = [];

  // Per-model grounded narratives keyed by the actual computed values.
  switch (model.meta.id) {
    case 'projectile-motion': {
      const range = valueOf(computed, 'range');
      const maxH = valueOf(computed, 'maxHeight');
      const flight = valueOf(computed, 'flightTime');
      const angle = fmt(vars.angle as number);
      const speed = fmt(vars.speed as number);
      if (q.includes('angle') || q.includes('角')) {
        lines.push(
          zh
            ? `当前发射角为 ${angle}°。水平射程取决于水平和竖直速度分量的乘积，在忽略空气阻力时，45° 给出最大射程。现在的射程是 ${range}。试着把角度调向 45° 看射程如何变化。`
            : `Your launch angle is ${angle}°. Range depends on the product of the horizontal and vertical velocity components, so (ignoring air resistance) 45° gives the maximum range. Right now the range is ${range}. Try moving the angle toward 45° and watch how the range responds.`
        );
      } else if (q.includes('height') || q.includes('高')) {
        lines.push(
          zh
            ? `最大高度由竖直方向初速度决定。当前最大高度为 ${maxH}，飞行时间为 ${flight}。增大速度或角度都会让物体飞得更高。`
            : `Maximum height is set by the vertical part of the initial velocity. Here the max height is ${maxH} and the flight time is ${flight}. Increasing either the speed or the angle makes it climb higher.`
        );
      } else {
        lines.push(
          zh
            ? `物体以 ${speed} m/s、${angle}° 发射。它沿抛物线运动：水平方向匀速，竖直方向受重力减速再加速。目前射程 ${range}，最大高度 ${maxH}，飞行时间 ${flight}。`
            : `The projectile is launched at ${speed} m/s and ${angle}°. It follows a parabola: constant horizontal speed while gravity slows then speeds the vertical motion. Currently the range is ${range}, the max height is ${maxH}, and it stays airborne for ${flight}.`
        );
      }
      break;
    }
    case 'ohms-law': {
      const current = valueOf(computed, 'current');
      const power = valueOf(computed, 'power');
      const v = fmt(vars.voltage as number);
      const r = fmt(vars.resistance as number);
      const closed = vars.closed as boolean;
      if (!closed) {
        lines.push(
          zh
            ? `电路当前是断开的，所以没有电流流动（I = 0）。合上开关后，电流会等于电压除以电阻。`
            : `The circuit is open, so no current flows (I = 0). Close the switch and the current becomes voltage divided by resistance.`
        );
      } else if (q.includes('power') || q.includes('功率')) {
        lines.push(
          zh
            ? `功率 P = V × I，当前为 ${power}。提高电压或降低电阻都会增大电流，从而增大功率。`
            : `Power is P = V × I, currently ${power}. Raising the voltage or lowering the resistance increases the current, which raises the power.`
        );
      } else {
        lines.push(
          zh
            ? `根据欧姆定律 I = V / R：电压 ${v} V、电阻 ${r} Ω，得到电流 ${current}，功率 ${power}。电阻越大，相同电压下电流越小。`
            : `By Ohm's law I = V / R: with ${v} V across ${r} Ω you get a current of ${current} and a power of ${power}. A larger resistance means less current for the same voltage.`
        );
      }
      break;
    }
    case 'acid-base-titration': {
      const ph = valueOf(computed, 'pH');
      const eqv = valueOf(computed, 'equivVolume');
      const added = fmt(vars.addedVolume as number);
      lines.push(
        zh
            ? `已加入 ${added} mL 碱。当前 pH 为 ${ph}。当量点（酸碱恰好中和）大约在加入 ${eqv} 时出现，此时 pH 在该点附近会快速跳变。`
            : `You've added ${added} mL of base. The current pH is ${ph}. The equivalence point (where acid and base exactly neutralize) is near ${eqv} of added base, and the pH jumps sharply right around there.`
      );
      if (q.includes('indicator') || q.includes('指示')) {
        lines.push(
          zh
            ? `指示剂的变色范围应覆盖当量点附近的 pH 突跃，这样颜色变化才能准确标志中和完成。`
            : `A good indicator changes color across the pH jump near the equivalence point, so the color change accurately marks neutralization.`
        );
      }
      break;
    }
    case 'function-transform': {
      const fn = String(vars.fn);
      const a = fmt(vars.a as number);
      const h = fmt(vars.h as number);
      const k = fmt(vars.k as number);
      lines.push(
        zh
          ? `当前函数是 ${fn} 的变换。a=${a} 控制竖直缩放（|a|>1 拉伸，<1 压缩，负号翻转），h=${h} 是水平平移（向右为正），k=${k} 是竖直平移。逐个改变它们能清楚看到每个参数的作用。`
          : `You're transforming the base function ${fn}. a=${a} controls vertical scaling (|a|>1 stretches, <1 compresses, negative flips), h=${h} shifts horizontally (right is positive), and k=${k} shifts vertically. Change one at a time to isolate each effect.`
      );
      break;
    }
    case 'fractions': {
      const numr = fmt(vars.numerator as number);
      const den = fmt(vars.denominator as number);
      const val = valueOf(computed, 'value');
      const simplified = valueOf(computed, 'simplified');
      lines.push(
        zh
          ? `这个分数是 ${numr}/${den}：整体被平均分成 ${den} 份，其中 ${numr} 份被涂色，等于 ${val}（最简形式 ${simplified}）。${Number(numr) > Number(den) ? '因为分子大于分母，这是一个假分数，超过一个整体。' : ''}`
          : `This fraction is ${numr}/${den}: the whole is split into ${den} equal parts and ${numr} are shaded, which equals ${val} (simplified to ${simplified}).${Number(numr) > Number(den) ? ' Since the numerator is larger than the denominator, this is an improper fraction — more than one whole.' : ''}`
      );
      break;
    }
    default:
      lines.push(
        zh
          ? `这是「${model.meta.titleZh}」的当前状态。调整参数并观察数据与图表的变化。`
          : `This is the current state of "${model.meta.title}". Adjust the parameters and watch the data and chart respond.`
      );
  }

  // Append a gentle observation prompt (§14.2 encourage comparison).
  lines.push(
    zh
      ? `试着改变一个参数并对比前后的结果，看看哪个量受影响最大。`
      : `Try changing one parameter and compare the before/after results to see which value is most affected.`
  );
  return lines.join('\n\n');
}

export async function explain(input: ExplainInput): Promise<string> {
  const cfg = typeof window !== 'undefined' ? window.__LABVIVID_AI__ : undefined;
  if (cfg?.endpoint) {
    try {
      return await explainRemote(input, cfg);
    } catch {
      // Fall back to local grounded explanation on any remote failure (§11.3).
      return localExplain(input);
    }
  }
  // Simulate slight latency so the UI shows its non-blocking "thinking" state.
  await new Promise((r) => setTimeout(r, 250));
  return localExplain(input);
}
