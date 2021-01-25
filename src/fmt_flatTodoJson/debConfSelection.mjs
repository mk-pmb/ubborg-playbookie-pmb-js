// -*- coding: utf-8, tab-width: 2 -*-

const debConfMultiSelectSeparator = ',';


function popValue(t, popProp) {
  const k = 'answer';
  if (t === 'multiselect') {
    return popProp.mustBe('ary', k).join(debConfMultiSelectSeparator);
  }
  return String(popProp.mustBe('str | num | bool', k));
}


function translate(ctx) {
  const { popProp } = ctx;
  const c = {};
  function h(r, k) { c[k] = popProp.mustBe(r, k); }
  h('nonEmpty str', 'pkg');
  h('nonEmpty str', 'question');
  const t = popProp.mustBe('nonEmpty str', 'kind');
  c.vtype = t;
  c.value = popValue(t, popProp);
  const s = popProp.mustBe('bool | undef', 'seen');
  if (s !== undefined) { c.unseen = !s; }
  return { 'ansible.builtin.debconf': c };
}


export default translate;
