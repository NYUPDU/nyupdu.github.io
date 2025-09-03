/* Generic AJAX form handler + quick feedback drawer + toasts
   Replace the Formspree endpoint(s) in your HTML:
   data-endpoint="https://formspree.io/f/YOUR_GENERAL_ENDPOINT"
*/

(function(){
  const toastRoot = document.getElementById('toast-root');

  function showToast(msg = 'Done', timeout = 3600){
    if(!toastRoot) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastRoot.appendChild(el);
    setTimeout(()=> {
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(()=> el.remove(), 200);
    }, timeout);
  }

  function nowISO(){ return new Date().toISOString(); }

  // Attach timers for spam check
  document.querySelectorAll('form.pdu-form').forEach(f=>{
    const start = f.querySelector('input[name="_submit_start"]');
    if(start){ start.value = String(Date.now()); }
  });

  // Micro thumbs behavior
  document.querySelectorAll('.pdu-form.micro .thumb').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.pdu-form.micro .thumb').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      // ensure a hidden field stores value
      let hidden = btn.closest('form').querySelector('input[name="vote"]');
      if(!hidden){
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'vote';
        btn.closest('form').appendChild(hidden);
      }
      hidden.value = btn.dataset.value;
    });
  });

  // Generic submit handler
  async function handleSubmit(ev){
    ev.preventDefault();
    const form = ev.currentTarget;
    const endpoint = form.dataset.endpoint;
    const formName = form.dataset.formName || 'form';
    if(!endpoint){
      showToast('Form endpoint missing'); 
      return;
    }

    // Spam checks
    const honey = form.querySelector('input[name="_honey"]');
    if(honey && honey.value){ return; } // bot
    const start = form.querySelector('input[name="_submit_start"]');
    if(start){
      const delta = Date.now() - Number(start.value || Date.now());
      if(delta < 1200){ 
        showToast('Please wait a moment before submitting.');
        return;
      }
    }

    // Build payload
    const fd = new FormData(form);
    fd.append('_subject', `PDU ${formName} submission`);
    fd.append('page_url', window.location.href);
    fd.append('submitted_at', nowISO());
    // If a topic button on the page set a topic, respect it
    const topicFromButton = form.dataset.topic || '';
    if(topicFromButton && !fd.get('topic')) fd.append('topic', topicFromButton);

    try{
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd
      });
      if(res.ok){
        showToast('Thanks  -  your message was sent.');
        form.reset();
        // reset submit timers
        const start2 = form.querySelector('input[name="_submit_start"]');
        if(start2){ start2.value = String(Date.now()); }
      }else{
        showToast('Sorry, there was a problem. Please try again.');
      }
    }catch(err){
      showToast('Network error. Please try again.');
    }
  }

  document.querySelectorAll('form.pdu-form').forEach(f=>{
    f.addEventListener('submit', handleSubmit);
  });

  // If a link/button includes data-topic, set the select on click
  document.querySelectorAll('a[data-topic], button[data-topic]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const topic = el.getAttribute('data-topic');
      const select = document.querySelector('#topic');
      if(select && topic){
        select.value = topic;
        // propagate to form dataset for submit if needed
        const form = select.closest('form');
        if(form) form.dataset.topic = topic;
      }
    });
  });

  // Quick drawer
  const fab = document.getElementById('feedbackFab');
  const drawer = document.getElementById('quickDrawer');
  const closeBtn = document.getElementById('qdClose');
  function openDrawer(){
    if(!drawer) return;
    drawer.setAttribute('aria-hidden','false');
    const ta = drawer.querySelector('textarea');
    if(ta) ta.focus();
  }
  function closeDrawer(){
    if(!drawer) return;
    drawer.setAttribute('aria-hidden','true');
  }
  if(fab){ fab.addEventListener('click', openDrawer); }
  if(closeBtn){ closeBtn.addEventListener('click', closeDrawer); }
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });

})();