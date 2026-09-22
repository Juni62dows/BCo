(() => {
  const raceFallback = { human:22.81, elf:28.22, darkelf:19.47, orc:11.92, dwarf:17.58 };
  const nodeFallback = [
    ['Russia','Moscow','8ms'],['Russia','Vladivostok','13ms'],['Europe','Warsaw','7ms'],['Europe','Frankfurt','11ms'],['Europe','London','8ms'],['Europe','Amsterdam','7ms'],['Middle East','Istanbul','9ms'],['Middle East','Dubai','14ms'],['Asia','Seoul','13ms'],['Asia','Tokyo','15ms'],['Asia','Hong Kong','13ms'],['Asia','Mumbai','15ms'],['Asia','Bangkok','17ms'],['Asia','Hanoi','15ms'],['Asia','Ho Chi Minh City','15ms'],['Asia','Singapore','15ms'],['Asia','Manila','20ms'],['Asia','Jakarta','20ms'],['North America','New York','15ms'],['North America','Dallas','17ms'],['North America','Los Angeles','15ms'],['South America','Sao Paulo','17ms'],['Africa','Johannesburg','19ms'],['Oceania','Sydney','24ms']
  ];
  const api = { races:'https://api-reproxy.dalam.world/checkstat', server:'https://api-reproxy.dalam.world/checkvds' };
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  const t = document.documentElement.lang.startsWith('zh') ? { online:'在线', offline:'离线' } : { online: (document.documentElement.lang==='ru'?'онлайн':document.documentElement.lang==='pl'?'online':document.documentElement.lang==='id'?'online':document.documentElement.lang==='fr'?'en ligne':'online'), offline:(document.documentElement.lang==='ru'?'офлайн':document.documentElement.lang==='pl'?'offline':document.documentElement.lang==='id'?'offline':document.documentElement.lang==='fr'?'hors ligne':'offline') };

  function parsePing(v){ return Number.parseInt(String(v).replace(/[^0-9]/g,''),10) || 999; }
  function setStatus(el, status){ if(!el) return; const online = String(status).toLowerCase()==='online'; el.textContent = online ? t.online : t.offline; el.classList.toggle('offline', !online); }
  function updateRace(data){
    const obj = (data && typeof data === 'object') ? data : raceFallback;
    let total = 0; const parts=[]; const angles=[]; const colors=['#64e6b0','#f6c85f','#9067e8','#ff7c6e','#76959c'];
    const keys=['human','elf','darkelf','orc','dwarf'];
    keys.forEach(k=>{ const v = Number(obj[k]); const n=Number.isFinite(v)?v:raceFallback[k]; total += n; parts.push([k,n]); });
    let a=0; parts.forEach(([k,v],i)=>{ const deg=(v/Math.max(total,100))*360; angles.push(`${colors[i]} ${a}deg ${a+deg}deg`); a+=deg; const value=$(`[data-race-value="${k}"]`); const bar=$(`[data-race-meter="${k}"]`); if(value) value.textContent=v.toFixed(2)+'%'; if(bar) bar.style.width=Math.min(v,100)+'%'; });
    const donut=$('[data-donut]'); if(donut) donut.style.background=`conic-gradient(${angles.join(',')})`;
    const totalEl=$('[data-total-races]'); if(totalEl) totalEl.textContent=(total.toFixed(2))+'%';
  }
  function updateServer(data){
    const obj = data && Array.isArray(data.locations) ? data : {server_name:'Bender World Main Proxy Status',server_status:'online',total_nodes:24,timestamp:'2026-09-22T09:31:20Z',locations:nodeFallback.map(([region,node,ping])=>({region,node,status:'online',ping}))};
    const mainName=$('[data-server-name]'); if(mainName) mainName.textContent=obj.server_name||'Bender World Main Proxy Status';
    setStatus($('[data-main-status]'), obj.server_status||'offline');
    const totalEl=$('[data-total-nodes]'); if(totalEl) totalEl.textContent=obj.total_nodes ?? obj.locations.length;
    const min = (obj.locations||[]).map(x=>parsePing(x.ping)).filter(x=>x<999).sort((a,b)=>a-b)[0]; const minEl=$('[data-min-ping]'); if(minEl) minEl.textContent=(min||7)+'ms';
    const ts=$('[data-update-time]'); if(ts) ts.textContent=obj.timestamp ? new Date(obj.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—';
    const preview=$('[data-region-preview]'); if(preview){ const group={}; (obj.locations||[]).forEach(n=>{(group[n.region]??=[]).push(n)}); preview.innerHTML=Object.entries(group).slice(0,6).map(([r,arr])=>`<div class="region-chip"><strong>${r}</strong><small>${arr.length} nodes · ${Math.min(...arr.map(x=>parsePing(x.ping)))}ms best</small></div>`).join(''); }
    const grid=$('[data-region-grid]'); if(grid){ grid.innerHTML=(obj.locations||[]).map(n=>`<div class="region-node"><strong><span class="dot ${String(n.status).toLowerCase()==='online'?'online':''}"></span>${n.node}</strong><small>${n.region}</small><div class="ping">${n.ping}</div></div>`).join(''); }
  }
  async function fetchJSON(url, fallback, handler){
    try{
      const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),6000);
      const res=await fetch(url,{signal:controller.signal,cache:'no-store'}); clearTimeout(timer); if(!res.ok) throw new Error('HTTP '+res.status);
      const data=await res.json(); handler(data); return true;
    }catch(e){ handler(fallback); return false; }
  }
  updateRace(raceFallback); updateServer();
  fetchJSON(api.races, raceFallback, updateRace);
  fetchJSON(api.server, {server_name:'Dalam World Main Proxy Status',server_status:'online',total_nodes:24,timestamp:'2026-09-22T09:31:20Z',locations:nodeFallback.map(([region,node,ping])=>({region,node,status:'online',ping}))}, updateServer);
  const refresh=$('[data-refresh]'); if(refresh){ refresh.addEventListener('click', async()=>{ refresh.disabled=true; await Promise.all([fetchJSON(api.races,raceFallback,updateRace),fetchJSON(api.server,null,updateServer)]); refresh.disabled=false; }); }
})();
