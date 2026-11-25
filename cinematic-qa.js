(() => {
  const view = document.querySelector('#view'), result = document.querySelector('#result');
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const doc = () => view.contentDocument;
  const film = () => doc().querySelector('video');
  let results = [];
  const add = (name, pass, detail) => { results.push({name,pass,detail}); result.textContent = JSON.stringify(results,null,2); };
  const seek = y => view.contentWindow.scrollTo({top:y,behavior:'instant'});
  document.querySelector('#desktop').onclick = () => {view.style.width='1440px';view.style.height='900px';};
  document.querySelector('#mobile').onclick = () => {view.style.width='390px';view.style.height='844px';};
  document.querySelector('#restart').onclick = () => {view.src='cinematic-opening.html?qa='+Date.now();};
  document.querySelector('#river').onclick = () => seek(view.contentWindow.innerHeight*1.4);
  document.querySelector('#back').onclick = () => seek(0);
  setInterval(() => {
    const f=film(); if(!f)return;
    document.querySelector('#metrics').textContent=`${doc().body.dataset.cameraMode || 'loading'} · ${f.currentTime.toFixed(2)} s · ${f.videoWidth}×${f.videoHeight} · ${view.clientWidth}px`;
  },250);
  document.querySelector('#run').onclick = async () => {
    const button=document.querySelector('#run');button.disabled=true;results=[];
    try {
      for(const width of [1440,390]) {
        view.style.width=width+'px';view.style.height=(width===390?844:900)+'px';
        view.src='cinematic-opening.html?qa='+Date.now();
        const deadline=Date.now()+25000;
        while(Date.now()<deadline && (!doc()?.body?.classList.contains('ready') || film()?.readyState<2))await sleep(100);
        add(width+' media ready',film()?.videoWidth===854 && doc().body.classList.contains('ready'),{width:film()?.videoWidth,height:film()?.videoHeight});
        const t=film().currentTime;await sleep(1200);add(width+' autoplay progresses',film().currentTime>t+.5,{from:t,to:film().currentTime});
        while(film().currentTime<4.78 && Date.now()<deadline)await sleep(100);
        await sleep(250);add(width+' automatic handoff',film().paused && Math.abs(film().currentTime-4.8)<.08,{time:film().currentTime,paused:film().paused});
        const viewport=view.contentWindow.innerHeight;
        for(const fraction of [.35,.85,1.4]){seek(viewport*fraction);await sleep(550);}
        add(width+' scroll reaches exterior',film().currentTime>9,{time:film().currentTime});
        for(const fraction of [.8,.3,0]){seek(viewport*fraction);await sleep(550);}
        add(width+' reverse returns to books',film().currentTime<.1,{time:film().currentTime});
        add(width+' no horizontal overflow',doc().documentElement.scrollWidth<=view.contentWindow.innerWidth,{scrollWidth:doc().documentElement.scrollWidth,viewport:width});
        add(width+' HTML headline present',doc().querySelector('h1').textContent.replace(/\s+/g,' ').includes('Bir fikir gerçekten'),{});
        const h=doc().querySelector('h1').getBoundingClientRect();add(width+' headline fits viewport',h.left>=0 && h.right<=width && h.bottom<viewport,{left:h.left,right:h.right,bottom:h.bottom});
        doc().querySelector('[data-theme-toggle]').click();await sleep(100);add(width+' theme toggles',doc().documentElement.dataset.theme===view.contentWindow.localStorage.getItem('ag-theme'),{theme:doc().documentElement.dataset.theme});
        const links=[...doc().querySelectorAll('nav a')];add(width+' navigation preserved',links.length===3 && links.every(a=>a.getAttribute('href').endsWith('.html')),links.map(a=>a.getAttribute('href')));
      }
    } catch(e){add('runtime',false,String(e));}
    button.disabled=false;document.body.dataset.qaComplete='true';document.body.dataset.qaPassed=String(results.filter(x=>x.pass).length);document.body.dataset.qaFailed=String(results.filter(x=>!x.pass).length);
    window.cinematicQA=results;
  };
})();
