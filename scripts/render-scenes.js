/* Decorative signature. All three content scenes remain static, semantic HTML. */
function signature(state = 0, local = false) {
  return `<div class="ag-signature${local ? ' local-signature' : ''}" data-signature-state="${state}" aria-hidden="true"><div class="signature-rings"><i class="signature-ring ring-outer" data-morph></i><i class="signature-ring ring-middle" data-morph></i><i class="signature-ring ring-inner" data-morph></i><span class="signature-mark" data-morph>AG<span></span></span></div></div>`;
}
module.exports = { signature };
