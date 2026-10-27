(() => {
  const link = document.querySelector('.hero-actions [href="assets/situation-plan-client.png"]');
  const dialog = document.querySelector('#situation-plan-dialog');
  if (!link || !dialog) return;
  link.addEventListener('click', event => {
    event.preventDefault();
    dialog.showModal();
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => link.focus({ preventScroll: true }));
})();
