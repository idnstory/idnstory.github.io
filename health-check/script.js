function render() {
  window.$$data.items.forEach((v) => {
    const $list = document.querySelector('#health-check-list');
  
    const $item = document.createElement('health-check-item');
    $item.setAttribute('label', v.label ?? '');
    $item.setAttribute('url', v.url ?? '');
    $item.setAttribute('sites', v.sites?.join(',') ?? '');
  
    $list.appendChild($item);
  });
}


render();