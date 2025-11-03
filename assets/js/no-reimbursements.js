(function(){
  const bannedPattern = /\breimburse(?:ment|ments|d|s)?\b/i;

  function flagNode(node){
    const parent = node.parentElement;
    if(!parent) return;
    parent.setAttribute('data-reimbursement-flag', '');
  }

  function scan(){
    const matches = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    while(walker.nextNode()){
      const node = walker.currentNode;
      if(bannedPattern.test(node.textContent)){
        matches.push(node);
      }
    }

    if(!matches.length) return;

    matches.forEach(flagNode);

    const banner = document.createElement('div');
    banner.className = 'no-reimbursements-banner';
    banner.textContent = 'Reminder: PDU does not offer reimbursements. Please remove this language.';
    document.body.appendChild(banner);
  }

  function injectStyles(){
    if(document.getElementById('no-reimbursements-style')) return;
    const style = document.createElement('style');
    style.id = 'no-reimbursements-style';
    style.textContent = `
      [data-reimbursement-flag]{
        outline: 3px solid #c5221f;
        background: rgba(197,34,31,0.08);
      }
      .no-reimbursements-banner{
        position: fixed;
        inset: auto 1rem 1rem;
        background: #c5221f;
        color: #fff;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        font: 600 0.95rem/1.35 "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        z-index: 9999;
        max-width: min(28rem, 90vw);
        box-shadow: 0 12px 32px rgba(25,25,25,0.28);
      }
    `;
    document.head.appendChild(style);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ injectStyles(); scan(); });
  }else{
    injectStyles();
    scan();
  }
})();
