export function cleanupPrismPlugins(block: HTMLElement | null, pre: HTMLElement) {
  if (!block) return;

  block.querySelectorAll(".toolbar, .line-numbers-rows").forEach((element) => element.remove());
  pre.classList.remove("line-numbers");
  pre.removeAttribute("data-line");

  const wrapper = pre.parentElement;
  if (wrapper?.classList.contains("code-toolbar")) {
    const body = wrapper.closest<HTMLElement>(".tiphia-code-body") || block;
    body.insertBefore(pre, wrapper);
    wrapper.remove();
  }
}
