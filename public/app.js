/* Yeshiva Bonilla local-first working build.
 * The user's curriculum, notes, results and settings persist in localStorage.
 * Uploaded media uses IndexedDB. Personas are NOT secure accounts.
 * Do not publish this static local workspace as a real student LMS.
 * A separate Supabase integration is included for eventual migration.
 */
(() => {
  'use strict';
  const KEY = 'yeshiva-bonilla-local-workspace-v2';
  const LEGACY_KEY = 'yeshiva-bonilla-v1-demo';
  const LOCAL_MEDIA = window.YeshivaLocalMedia;
  let storageAvailable = true;
  const SESSION = 'yeshiva-bonilla-persona';
  const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = esc;
  const safeLink = input => {
    try { const u = new URL(input, location.href); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch (_) { return ''; }
  };
  function trustedEmbedUrl(input) {
    try {
      const url = new URL(input);
      const h = url.hostname.toLowerCase();
      let id = '';
      if (['youtu.be','www.youtu.be'].includes(h)) id = url.pathname.slice(1);
      else if (['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com','youtube-nocookie.com'].includes(h))
        id = url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/)?.[1] || '';
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
      if (['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(h)) {
        const n=url.pathname.match(/\/(?:video\/)?(\d+)(?:\/|$)/)?.[1];
        if(n) return `https://player.vimeo.com/video/${n}`;
      }
    } catch (_) {}
    return '';
  }
  const now = () => new Date().toISOString();
  const sampleHTML = {
    a1:`<h2>The Meaning and Purpose of Torah</h2><p>The Hebrew word <strong>Torah</strong> is often translated “law,” but also carries the meaning of instruction or teaching. Biblical context matters when discussing what it means to obey God.</p><blockquote>“The law of the LORD is perfect, converting the soul.” — Psalm 19:7</blockquote><p>This introductory lesson invites students to examine the Torah directly, asking how its teachings connect to our relationship with God and the example of Yeshua.</p><h2>Questions for reflection</h2><p>What does Scripture itself say about the purpose of God's instructions?</p>`,
    a2:`<h2>What Did Yeshua Teach?</h2><p>In Matthew 5:17–20, Yeshua addresses the Law and the Prophets. This lesson introduces the historical setting and examines the wording of the passage.</p><blockquote>“Think not that I am come to destroy the law, or the prophets.” — Matthew 5:17</blockquote><p>Read the full passage and consider how Yeshua frames obedience, teaching, and righteousness.</p>`,
    a3:`<h2>Walking Out Faith</h2><p>How should belief influence everyday choices? In this article we consider the relationship between faith, love, and keeping the commandments.</p><p>Read John 14:15, 1 John 5:3, and James 2:17, then write down your observations.</p>`,
    a4:`<h2>Beginning a Weekly Study</h2><p>Establish a regular routine for reading the Torah, Prophets, Writings, and apostolic texts. Record questions, compare translations, and allow context to guide conclusions.</p>`,
    a5:`<h2>The Sabbath in Scripture</h2><p>Trace the Sabbath theme from Genesis 2 through Exodus 20, the Prophets, and the Gospels. Identify where Scripture provides explicit commands and where later interpretations differ.</p>`,
    a6:`<h2>Introducing the Biblical Feasts</h2><p>Leviticus 23 names the appointed times. This overview introduces the biblical calendar and the major annual observances without assuming the student has prior knowledge.</p>`
  };
  function seed() {
    const article = (id, title, summary, body, level='Beginner',status='published') => ({id,title,slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),summary,body,level,status,updated:now(),version:1});
    return {
      articles:[
        article('a1','What Is Torah?','A foundational introduction to the meaning of Torah and its purpose.',sampleHTML.a1),
        article('a2','Yeshua and the Torah','Examine the teachings of Yeshua concerning the Law and the Prophets.',sampleHTML.a2),
        article('a3','Faith and Obedience','Explore how belief and obedience relate in the Scriptures.',sampleHTML.a3),
        article('a4','How to Study Scripture','Practical guidance for reading biblical texts carefully.',sampleHTML.a4),
        article('a5','The Sabbath in Scripture','An overview of the Sabbath across the biblical canon.',sampleHTML.a5,'Intermediate'),
        article('a6','The Appointed Times','An introduction to the feasts described in Leviticus 23.',sampleHTML.a6,'Intermediate')
      ],
      tests:[
        {id:'t1',title:'Foundations Review',description:'Check your understanding of the introductory material.',status:'published',version:1,questions:[
          {id:'q1',type:'single',prompt:'Which book begins the Torah?',explanation:'Genesis is the first book of the Torah.',choices:[{id:'c1',label:'Genesis',correct:true},{id:'c2',label:'Psalms',correct:false},{id:'c3',label:'Matthew',correct:false}]},
          {id:'q2',type:'multiple',prompt:'Which books belong to the five books of the Torah?',explanation:'Genesis, Exodus, Leviticus, Numbers, and Deuteronomy make up the Torah.',choices:[{id:'c4',label:'Genesis',correct:true},{id:'c5',label:'Deuteronomy',correct:true},{id:'c6',label:'Romans',correct:false},{id:'c7',label:'Psalms',correct:false}]}
        ]},
        {id:'t2',title:'Practical Walk Review',description:'A short review of foundational practical topics.',status:'published',version:1,questions:[{id:'q3',type:'single',prompt:'Where are the appointed times listed together?',explanation:'Leviticus 23 lists the appointed times.',choices:[{id:'c8',label:'Leviticus 23',correct:true},{id:'c9',label:'Romans 8',correct:false},{id:'c10',label:'Psalm 1',correct:false}]}]}
      ],
      modules:[
        {id:'m1',title:'Understanding Torah',description:'Start with key concepts and biblical language.',status:'published',items:[{type:'article',id:'a1'},{type:'article',id:'a4'},{type:'test',id:'t1'}]},
        {id:'m2',title:'Following Yeshua',description:'The example and teaching of the Messiah.',status:'published',items:[{type:'article',id:'a2'},{type:'article',id:'a3'}]},
        {id:'m3',title:'Practical Foundations',description:'Beginning the everyday walk.',status:'published',items:[{type:'article',id:'a5'},{type:'article',id:'a6'},{type:'test',id:'t2'}]}
      ],
      courses:[
        {id:'co1',title:'Foundations of Torah',description:'A structured starting point for understanding Scripture, the teachings of Yeshua, and a faithful walk.',status:'published',level:'Beginner',items:[{type:'module',id:'m1'},{type:'module',id:'m2'},{type:'article',id:'a5'}]},
        {id:'co2',title:'Living a Pronomian Walk',description:'Explore practical observance, weekly study, and biblical appointed times.',status:'published',level:'Intermediate',items:[{type:'module',id:'m3'},{type:'article',id:'a3'}]}
      ],
      progress:['a1'],bookmarks:['a2'],notes:{a1:'Review Psalm 19 and Matthew 5 together.'},attempts:[],enrollments:['co1'],donationUrl:'',studentRecords:[{name:'Local Student',email:'student@example.test',courses:1,completed:1},{name:'Sample Learner',email:'learner@example.test',courses:2,completed:5}]
    };
  }
  const live=window.YeshivaLive,remote=Boolean(live?.enabled);
  const blank=()=>({articles:[],modules:[],courses:[],tests:[],progress:[],bookmarks:[],notes:{},attempts:[],enrollments:[],donationUrl:'',studentRecords:[],media:[]});
  let db;
  if(remote)db=blank();
  else try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
    const restored = raw ? JSON.parse(raw) : null;
    db = restored && Array.isArray(restored.articles) && Array.isArray(restored.courses) && Array.isArray(restored.tests) && Array.isArray(restored.modules) ? restored : seed();
    db.media ||= [];
    db.schemaVersion = 2;
  } catch (_) { db = seed(); storageAvailable = false; }
  if (!remote && storageAvailable) try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (_) { storageAvailable = false; }
  const deepCopy=obj=>JSON.parse(JSON.stringify(obj));
  let lastSynced=deepCopy(db),syncing=false,pending=null,unsavedTestIds=new Set();
  function save(){
    if(!remote){
      db.schemaVersion = 2;
      db.localUpdatedAt = now();
      try{
        // A draft preview temporarily looks published in memory, but must never become published on disk.
        const snapshot=ui._restore?deepCopy(db):db;
        if(ui._restore){const item=snapshot[ui._restore.type+'s']?.find(x=>x.id===ui._restore.id);if(item)item.status=ui._restore.status;}
        localStorage.setItem(KEY,JSON.stringify(snapshot));storageAvailable=true;
      }
      catch(e){storageAvailable=false;toast('Local storage is unavailable or full. Export a backup before closing the browser.');}
      return;
    }
    if(!ui.persona)return;
    if(ui.page==='testEditor'&&!ui.forceTestSave){ // Draft questions are saved atomically on explicit Save Test.
      if(!lastSynced.tests.some(t=>t.id===ui.itemId))return queueSync({testIds:[]});
      return;
    }
    queueSync({testIds:ui.forceTestSave?[ui.itemId]:[]});ui.forceTestSave=false;
  }
  function queueSync(opts={}){
    for(const id of opts.testIds||[])unsavedTestIds.add(id);
    pending=deepCopy(db);
    if(syncing)return;
    (async()=>{syncing=true;
      while(pending){const next=pending;pending=null;const testIds=[...unsavedTestIds];unsavedTestIds.clear();
        try { await live.persist(lastSynced,next,{saveTestIds:testIds});lastSynced=deepCopy(next); }
        catch(e){console.error('Yeshiva save failed',e);toast('Cloud save failed: '+e.message);unsavedTestIds=new Set([...unsavedTestIds,...testIds]);pending=null;break;}
      }
      syncing=false;
    })();
  }
  async function reloadRemote(){
    const state=await live.start();ui.persona=state.user?state.role:'';
    db=state.user?await live.load():blank();lastSynced=deepCopy(db);
    if(!state.user){db.donationUrl=await live.publicSettings();ui.page='home';}else if(ui.page==='home'||ui.page==='login')ui.page=state.role==='student'?'dashboard':'overview';
    render();
  }
  let initialPersona = '';
  if(!remote)try { initialPersona = sessionStorage.getItem(SESSION) || ''; } catch (_) {}
  const ui = {persona:initialPersona,page:'home',itemId:'',subTab:'',editing:'',testAnswers:{},lastResult:null,search:'',mobile:false,addType:'article',addId:''};
  const icons = {
    book:'<path d="M4 19.5V4.7a2 2 0 0 1 2-2h12v17H6a2 2 0 0 0 0 4h12"/><path d="M4 20a2 2 0 0 1 2-2"/>',
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>',
    dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    layers:'<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
    file:'<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h4M8 12h8M8 16h8"/>',
    test:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 2 2 5-5M8 18h8"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 4 5"/>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8"/>',
    bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
    notes:'<path d="M4 4h16v16H4zM8 9h8M8 13h8M8 17h5"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20V7"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l-2 2-2-.5a2 2 0 0 0-2 1.2H10a2 2 0 0 0-2-1.2l-2 .5-2-2a2 2 0 0 0 .3-2l-1.4-2 1.4-2A2 2 0 0 0 4 9l2-2 2 .5A2 2 0 0 0 10 6h4a2 2 0 0 0 2 1.5l2-.5 2 2a2 2 0 0 0-.3 2l1.4 2z"/>',
    media:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m3 18 6-6 4 4 3-3 5 5"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 3"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    play:'<path d="m8 5 11 7-11 7z"/>',
    arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
    left:'<path d="m15 5-7 7 7 7"/>',
    right:'<path d="m9 5 7 7-7 7"/>',
    up:'<path d="m6 14 6-6 6 6"/>',
    down:'<path d="m6 10 6 6 6-6"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/>',
    edit:'<path d="M4 20l5-.7L20 8.4 15.6 4 4.7 15z"/>',
    save:'<path d="M4 3h14l3 3v15H3V3zM7 3v7h10V3M7 21v-8h10v8"/>',
    logout:'<path d="M10 4H4v16h6m6-4 4-4-4-4m4 4H9"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    filedown:'<path d="M5 3h10l4 4v14H5zM12 10v7m-3-3 3 3 3-3"/>'
  };
  function icon(n){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[n]||icons.book}</svg>`;}
  function toast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3200);}
  function get(type,id){return (db[type+'s']||[]).find(x=>x.id===id);} // type names: article, module, course, test
  function lookup(item){return get(item.type,item.id);}
  function label(item){return lookup(item)?.title || '[Missing resource]';}
  function visible(item){const e=lookup(item);return !!e && e.status==='published';}
  function expand(items,onlyVisible=false){const out=[];for(const item of items||[]){if(onlyVisible&&!visible(item))continue;if(item.type==='module'){out.push(...expand(get('module',item.id)?.items,onlyVisible));}else out.push(item);}return out;}
  function courseItems(course,onlyVisible=false){return expand(course.items,onlyVisible);}
  function percent(course){const items=courseItems(course,true);if(!items.length)return 0;const done=items.filter(i=>i.type==='article'?db.progress.includes(i.id):db.attempts.some(a=>a.testId===i.id)).length;return Math.round(done/items.length*100);}
  function collectionHeading(title,desc,actions=''){return `<div class="page-title"><div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div>${actions}</div>`;}
  function badge(status){return `<span class="pill ${esc(status)}">${esc(status==='published'?'Published':status==='archived'?'Archived':'Draft')}</span>`;}
  function button(label,act,attrs='',variant='ghost'){return `<button class="btn ${variant}" type="button" data-act="${esc(act)}" ${attrs}>${label}</button>`;}
  function brand(){return `<div class="brand">${icon('book').replace('class="icon"','class="icon brand-icon"')}<div><div class="brand-name">YESHIVA BONILLA</div><div class="brand-sub">Torah · Yeshua · Faithful Living</div></div></div>`;}
  function publicHeader(){return `<header class="topbar">${brand()}<nav class="toplinks"><a href="#about" data-act="scrollAbout">About</a><a href="#courses" data-act="scrollCourses">Courses</a><a href="#about">Our Mission</a>${button('Try Demo','login','','transparent')}${button('Explore Demo','login','','')}</nav></header>`;}
  function home(){const courses=db.courses.filter(c=>c.status==='published');return `${publicHeader()}<main><section class="public-hero"><div class="content"><div class="eyebrow" style="color:#d0a768">WELCOME TO YESHIVA BONILLA</div><h1>Learn Torah.<br>Follow Yeshua.<br><span>Walk Faithfully.</span></h1><p>A structured place to study Scripture, ask meaningful questions, and apply biblical teaching to everyday life. Free courses for students at every level.</p><div class="hero-actions">${button('Try the Demo '+icon('arrow'),'login','', '')}${button('Explore Our Courses','scrollCourses','','ghost')}</div><div class="small" style="margin-top:18px;color:#aab6c0">Free learning · Structured study · Personal progress</div></div></section><section id="about" class="public-values"><div class="card value-card">${icon('book')}<h3>Learn Scripture</h3><p>Study biblical teachings with context and care.</p></div><div class="card value-card">${icon('layers')}<h3>Build Understanding</h3><p>Courses and modules from foundational to advanced.</p></div><div class="card value-card">${icon('heart')}<h3>Walk Faithfully</h3><p>Explore practical obedience in daily life.</p></div></section><section id="courses" class="public-section"><div class="section-head"><div><div class="eyebrow">COURSE LIBRARY</div><h2>Explore Our Courses</h2></div><span class="muted small">Select a demo role to explore lessons</span></div><div class="course-grid">${courses.map(courseCard).join('')||'<p>Courses will be published soon.</p>'}</div></section><section class="public-section card padded"><div class="grid-2" style="align-items:center"><div><div class="eyebrow">SUPPORT FREE LEARNING</div><h2 style="font-size:30px;margin-top:10px">Help keep education accessible.</h2><p class="muted">Yeshiva Bonilla offers learning material without tuition. Optional donations may help sustain the school.</p></div><div style="text-align:center">${button(icon('heart')+' Support Yeshiva Bonilla','donate','','dark')}<p class="utility" style="margin-top:10px">${remote?'Donation link is enabled when configured by an administrator.':'Donations are not active in this prototype.'}</p></div></div></section></main><footer class="public-footer"><div>© ${new Date().getFullYear()} Yeshiva Bonilla.</div><div>${remote?'All courses are free; registration required for lessons.':'No payment processing or real student registration is enabled in demo mode.'}</div></footer>`;}
  function courseCard(course){const p=percent(course);return `<article class="card course-card" data-act="${ui.persona?'courseDetail':'login'}" data-id="${uid(course.id)}"><div class="course-art">${icon('book')}</div><div class="course-card-body"><span class="pill">${esc(course.level||'All levels')}</span><h3>${esc(course.title)}</h3><p>${esc(course.description)}</p><div class="progress"><span style="width:${p}%"></span></div><div class="progress-meta"><span>${courseItems(course,true).length} learning items</span><span>${ui.persona?p+'% complete':'Free enrollment'}</span></div></div></article>`;}
  function login(){if(remote)return `<div class="auth-layout"><div class="auth-side">${brand()}<div><div class="eyebrow">STUDY WITH YESHIVA BONILLA</div><h1>Learn Torah.<br>Follow Yeshua.</h1><p>Create a free student account to study courses, save private notes, and track your progress.</p></div><div class="small">All lessons are free.</div></div><div class="auth-form"><div class="eyebrow">STUDENT ACCESS</div><h2 style="margin-top:8px">Sign in or register</h2><form id="liveAuthForm" class="stack"><div class="field"><label for="authEmail">Email address</label><input class="input" type="email" id="authEmail" autocomplete="email" required /></div><div class="field"><label for="authPassword">Password</label><input class="input" type="password" id="authPassword" minlength="8" autocomplete="current-password" required /></div><div class="field" id="authNameWrap" hidden><label for="authName">Full name (optional)</label><input class="input" id="authName" autocomplete="name" /></div><div id="authNotice" class="notice" role="status" aria-live="polite" hidden></div><button class="btn dark" type="submit" id="authSubmit">Sign In</button></form><div class="row wrap" style="margin-top:18px">${button('Create a free account','toggleRegister','','ghost')}${button('Forgot password?','forgotPassword','','transparent')}${button('Return to Website','goHome','','transparent')}</div></div></div>`;
    return `<div class="auth-layout"><div class="auth-side">${brand()}<div><div class="eyebrow">A GROWING STUDY COMMUNITY</div><h1>Study deeply.<br>Walk faithfully.</h1><p>Courses, articles, personal study notes, and assessments in one organized platform.</p></div><div class="small">Yeshiva Bonilla · Prototype environment</div></div><div class="auth-form"><div class="eyebrow">INTERACTIVE DEMONSTRATION</div><h2 style="margin-top:8px">Open local workspace</h2><div class="notice"><strong>Local workspace:</strong> Select a role to explore the platform. Roles are simulations, not secure accounts. Your content is saved on this browser and can be exported from Management → Settings. Real authentication will be configured with Supabase.</div><div class="stack">${button('Continue as Demo Student '+icon('arrow'),'enter','data-role="student"','dark')}${button('Continue as Demo Instructor '+icon('arrow'),'enter','data-role="instructor"','ghost')}${button('Continue as Demo Administrator '+icon('arrow'),'enter','data-role="admin"','ghost')}${button('Return to Public Site','goHome','','transparent')}</div><p class="utility" style="margin-top:27px">Changes and uploaded files persist on this browser. Export a full backup from Management → Settings.</p></div></div>`;}
  const studentNav = [{id:'dashboard',label:'Dashboard',icon:'dashboard'},{id:'courses',label:'Course Library',icon:'book'},{id:'articles',label:'Articles',icon:'file'},{id:'bookmarks',label:'Bookmarks',icon:'bookmark'},{id:'notes',label:'My Notes',icon:'notes'},{id:'results',label:'My Progress',icon:'chart'}];
  const adminNav=[{id:'overview',label:'Overview',icon:'dashboard'},{id:'admin-articles',label:'Articles',icon:'file'},{id:'admin-modules',label:'Modules',icon:'layers'},{id:'admin-courses',label:'Courses',icon:'book'},{id:'admin-tests',label:'Tests',icon:'test'},{id:'admin-students',label:'Students',icon:'users'},{id:'admin-media',label:'Media Library',icon:'media'},{id:'admin-reports',label:'Reports',icon:'chart'},{id:'admin-settings',label:'Settings',icon:'settings'}];
  function shell(content,manage=false){const nav=manage?(ui.persona==='admin'?adminNav:adminNav.filter(n=>!['admin-settings','admin-students'].includes(n.id))):studentNav;return `<div class="app-shell"><aside class="sidebar ${ui.mobile?'open':''}"><div class="sidebar-head">${brand()}</div><nav class="sidebar-nav"><div class="nav-label">${manage?'MANAGEMENT':'MY LEARNING'}</div>${nav.map(i=>`<button class="nav-item ${ui.page===i.id?'selected':''}" data-act="nav" data-page="${i.id}">${icon(i.icon)} ${i.label}</button>`).join('')}</nav><div class="sidebar-bottom">${(ui.persona!=='student'?`<button class="nav-item" data-act="switchPortal">${icon('users')} ${manage?'Student View':'Management'}</button>`:'')}<button class="nav-item" data-act="goHome">${icon('home')} Public Website</button><button class="nav-item" data-act="logout">${icon('logout')} ${remote?'Sign Out':'Exit Workspace'}</button></div></aside><section class="workarea"><header class="app-top"><div class="row">${button(icon('menu'),'toggleMenu','','transparent top-menu-btn')}<div class="searchbar">${icon('search')}<input id="quickSearch" placeholder="Search courses, articles, topics..." value="${esc(ui.search)}" /></div><span class="pill" style="white-space:nowrap">${remote?'Live account':'Local workspace'}</span></div><div class="app-top-right"><span>${manage?'Management Portal':'Learning Portal'}</span><div class="avatar">${ui.persona==='student'?'ST':ui.persona==='admin'?'MB':'IN'}</div><strong>${ui.persona==='student'?(remote?'Student':'Local Student'):ui.persona==='admin'?'Administrator':'Instructor'}</strong></div></header><main class="page">${content}<div class="footer-note">Yeshiva Bonilla · ${remote?'Connected to Supabase':'Saved in this browser · Back up via Management → Settings'}</div></main></section></div>`;}
  function stats(){const available=db.courses.filter(c=>c.status==='published');const completed=db.progress.length;const attempts=db.attempts.length;const scores=db.attempts.map(x=>x.scorePercent);return [{label:'Courses in Progress',v:db.enrollments.length,icon:'book'},{label:'Lessons Completed',v:completed,icon:'check'},{label:'Average Test Score',v:scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+'%':'—',icon:'chart'},{label:'Tests Taken',v:attempts,icon:'test'}];}
  function statCards(items){return `<div class="stat-grid">${items.map(s=>`<div class="card stat"><div><span class="muted">${esc(s.label)}</span><b>${esc(s.v)}</b></div>${icon(s.icon)}</div>`).join('')}</div>`;}
  function dashboard(){const resumed=db.enrollments.map(id=>get('course',id)).filter(Boolean);return `${collectionHeading('My Learning Dashboard','Continue your studies and build your understanding.',button(icon('heart')+' Support the School','donate','','ghost'))}${statCards(stats())}<div class="split"><div class="stack"><div><div class="section-head"><h2 class="subtitle">Continue Learning</h2>${button('Browse Courses '+icon('arrow'),'nav','data-page="courses"','transparent')}</div>${resumed.length?`<div class="course-grid" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">${resumed.map(courseCard).join('')}</div>`:`<div class="card empty">${icon('book')}<h3>Start your first course</h3><p>Explore the course library to begin.</p>${button('Browse Courses','nav','data-page="courses"','dark')}</div>`}</div><div class="card padded"><h3 class="subtitle">Recently Updated Articles</h3>${db.articles.filter(a=>a.status==='published').slice(0,4).map(a=>listRow(a.title,a.summary,'file','openArticle',a.id)).join('')}</div></div><aside class="stack"><div class="card padded"><h3 class="subtitle">My Bookmarks</h3>${db.bookmarks.length?db.bookmarks.map(id=>{const a=get('article',id);return a?listRow(a.title,'Saved for later','bookmark','openArticle',id):''}).join(''):'<p class="muted small">No saved articles yet.</p>'}</div><div class="card padded"><h3 class="subtitle">Latest Activity</h3>${db.attempts.slice(-3).reverse().map(a=>listRow(get('test',a.testId)?.title||'Test',`${a.scorePercent}% score`,'test','openTest',a.testId)).join('')||'<p class="muted small">Complete a test to see your results here.</p>'}</div></aside></div>`;}
  function listRow(title,subtitle,ico,act,id,extra=''){return `<div class="list-row"><div class="left"><div class="miniicon">${icon(ico)}</div><div><h4>${esc(title)}</h4><p>${esc(subtitle)}</p></div></div><div class="row">${extra}${button(icon('right'),act,`data-id="${uid(id)}"`,'transparent small-btn')}</div></div>`;}
  function studentCourses(){return `${collectionHeading('Course Library','Study at your own pace. Every published course is free.')}<div class="course-grid">${db.courses.filter(c=>c.status==='published' && (!ui.search || (c.title+' '+c.description).toLowerCase().includes(ui.search.toLowerCase()))).map(courseCard).join('')}</div>`;}
  function studentArticles(){return `${collectionHeading('Article Library','Independent lessons and readings available to enrolled learners.')}<div class="card padded">${db.articles.filter(a=>a.status==='published' && (!ui.search || (a.title+' '+a.summary).toLowerCase().includes(ui.search.toLowerCase()))).map(a=>listRow(a.title,a.summary,'file','openArticle',a.id,db.bookmarks.includes(a.id)?'<span class="pill">Saved</span>':'')).join('')||'<div class="empty">No matching articles.</div>'}</div>`;}
  function studentBookmarks(){return `${collectionHeading('My Bookmarks','Lessons you have saved for later.')}${db.bookmarks.length?`<div class="card padded">${db.bookmarks.map(id=>{const a=get('article',id);return a?listRow(a.title,a.summary,'bookmark','openArticle',id):''}).join('')}</div>`:`<div class="card empty">${icon('bookmark')}<h3>No bookmarks yet</h3><p>Save a lesson while reading it to see it here.</p></div>`}`;}
  function studentNotes(){return `${collectionHeading('My Notes','Private personal notes, organized by article.')}${Object.entries(db.notes).filter(([,v])=>v.trim()).length?`<div class="card padded">${Object.entries(db.notes).filter(([,v])=>v.trim()).map(([id,v])=>listRow(get('article',id)?.title||'Article',v.slice(0,90),'notes','openArticle',id)).join('')}</div>`:`<div class="card empty">${icon('notes')}<h3>No notes yet</h3><p>Open an article and start writing in the Notes panel.</p></div>`}`;}
  function studentResults(){return `${collectionHeading('My Progress','Review course completion and every assessment attempt.')}${statCards(stats())}<div class="card padded" style="margin-bottom:22px"><h3 class="subtitle">Course Progress</h3>${db.courses.filter(c=>c.status==='published').map(c=>`<div style="margin:14px 0"><div class="row between"><strong class="small">${esc(c.title)}</strong><span class="small muted">${percent(c)}%</span></div><div class="progress" style="margin-top:8px"><span style="width:${percent(c)}%"></span></div></div>`).join('')}</div><div class="card padded"><h3 class="subtitle">Test History</h3><table class="admin-table"><thead><tr><th>Test</th><th>Score</th><th>Correct</th><th>Date</th></tr></thead><tbody>${db.attempts.slice().reverse().map(a=>`<tr><td>${esc(get('test',a.testId)?.title||'Removed test')}</td><td>${a.scorePercent}%</td><td>${a.correct}/${a.total}</td><td>${new Date(a.date).toLocaleString()}</td></tr>`).join('')||'<tr><td colspan="4">No tests completed.</td></tr>'}</tbody></table></div>`;}
  function courseDetail(){const c=get('course',ui.itemId);if(!c||c.status!=='published')return studentCourses();const enrolled=db.enrollments.includes(c.id);return `${collectionHeading(c.title,c.description,button(enrolled?'Enrolled ✓':'Enroll for Free','enroll',`data-id="${uid(c.id)}"`,enrolled?'ghost':'dark'))}<div class="split"><div class="card padded"><div class="row between"><h3 class="subtitle">Course Curriculum</h3><span class="pill">${courseItems(c,true).length} learning items</span></div>${c.items.filter(visible).map((item,i)=>item.type==='module'?`<div class="outline-group"><h4>${icon('layers')} ${esc(label(item))}</h4>${(get('module',item.id)?.items||[]).filter(visible).map((child,j)=>curriculumLine(child,`${i+1}.${j+1}`)).join('')}</div>`:`<div class="outline-group">${curriculumLine(item,`${i+1}`)}</div>`).join('')||'<p>No published lessons yet.</p>'}</div><aside class="card padded"><div class="eyebrow">YOUR PROGRESS</div><h2 style="font-size:43px;margin:13px 0 7px">${percent(c)}%</h2><div class="progress"><span style="width:${percent(c)}%"></span></div><p class="muted small" style="margin-top:10px">Learn in any order. Tests may be retaken as often as you wish.</p>${button('Browse All Courses','nav','data-page="courses"','ghost')}</aside></div>`;}
  function curriculumLine(item,index){const x=lookup(item);if(!x)return '';const done=item.type==='article'?db.progress.includes(item.id):db.attempts.some(a=>a.testId===item.id);return `<button class="outline-item" data-act="${item.type==='article'?'openArticle':'openTest'}" data-id="${uid(item.id)}">${icon(done?'check':item.type==='article'?'file':'test')} <span style="flex:1">${esc(index)} &nbsp;${esc(x.title)}</span><span>${done?'Done':icon('right')}</span></button>`;}
  // Simple conservative sanitizer for untrusted local demonstration content. Production uses a vetted sanitizer on server and client.
  const allowedTags=new Set(['VIDEO','SOURCE','P','BR','H1','H2','H3','H4','STRONG','B','EM','I','U','S','UL','OL','LI','BLOCKQUOTE','A','TABLE','THEAD','TBODY','TR','TH','TD','IMG','DIV','SPAN','PRE','CODE','HR','IFRAME']);
  function sanitize(content){const doc=new DOMParser().parseFromString(`<div>${content||''}</div>`,'text/html');const root=doc.body.firstElementChild;if(!root)return '';function scrub(node){for(const child of Array.from(node.childNodes)){if(child.nodeType===8){child.remove();continue;}if(child.nodeType!==1)continue;if(!allowedTags.has(child.tagName)){const txt=doc.createTextNode(child.textContent||'');child.replaceWith(txt);continue;}for(const a of Array.from(child.attributes)){if(['A','VIDEO','IMG'].includes(child.tagName)&&a.name==='data-yb-path'&&(remote?/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[\w.\-]{1,200}$/i.test(a.value):/^local\/[a-z0-9-]{16,120}$/i.test(a.value))){continue;}if(child.tagName==='A'&&a.name==='href'&&a.value==='#'&&child.dataset.ybPath){continue;}if(child.tagName==='A'&&a.name==='href'&&safeLink(a.value)){child.setAttribute('href',safeLink(a.value));continue;}if(child.tagName==='IMG'&&a.name==='src'&&safeLink(a.value)){child.setAttribute('src',safeLink(a.value));continue;}if(child.tagName==='IMG'&&a.name==='alt')continue;if(child.tagName==='IFRAME'&&a.name==='src'&&trustedEmbedUrl(a.value)){child.setAttribute('src',trustedEmbedUrl(a.value));continue;}child.removeAttribute(a.name);}if(child.tagName==='A')child.setAttribute('rel','noopener noreferrer');if(child.tagName==='VIDEO'&&!child.dataset.ybPath){child.replaceWith(doc.createTextNode('[Video removed: invalid source]'));continue;}if(child.tagName==='VIDEO'&&child.dataset.ybPath)child.setAttribute('controls','');if(child.tagName==='IFRAME'){if(!child.getAttribute('src')){child.replaceWith(doc.createTextNode('[Video embed removed: unsupported source]'));continue;}child.setAttribute('title','Lesson video');child.setAttribute('loading','lazy');child.setAttribute('allowfullscreen','');child.setAttribute('referrerpolicy','strict-origin-when-cross-origin');}scrub(child);}}scrub(root);return root.innerHTML;}
  function reader(){const a=get('article',ui.itemId);if(!a||a.status!=='published')return studentArticles();const bookmarked=db.bookmarks.includes(a.id),done=db.progress.includes(a.id);const matches=db.courses.filter(c=>c.status==='published'&&courseItems(c,true).some(x=>x.type==='article'&&x.id===a.id));const parent=matches[0];let outline=parent?parent.items.filter(visible).map((item,i)=>item.type==='module'?`<div class="outline-group"><h4>${esc(label(item))}</h4>${get('module',item.id)?.items.filter(visible).map(child=>`<button class="outline-item ${child.id===a.id?'active':''}" data-act="${child.type==='article'?'openArticle':'openTest'}" data-id="${uid(child.id)}">${icon(child.type==='article'?'file':'test')}${esc(label(child))}</button>`).join('')}</div>`:`<div class="outline-group">${curriculumLine(item,String(i+1))}</div>`).join(''):db.articles.filter(x=>x.status==='published').map(x=>`<button class="outline-item ${x.id===a.id?'active':''}" data-act="openArticle" data-id="${uid(x.id)}">${icon('file')}${esc(x.title)}</button>`).join('');return `${collectionHeading('Lesson Reader','Read, reflect, take notes, and mark your lessons complete.') }<div class="reader-layout"><aside class="reader-outline"><div class="eyebrow">${esc(parent?.title||'ARTICLE LIBRARY')}</div><div class="small muted" style="margin-top:6px">Course outline</div>${outline}</aside><article class="reader-article"><div class="article-meta"><span class="pill">${esc(a.level||'All levels')}</span><span>Article</span><span>·</span><span>Self-paced</span></div><h1>${esc(a.title)}</h1><p class="muted">${esc(a.summary)}</p><div class="article-content">${sanitize(a.body)}</div><div class="row wrap" style="margin-top:40px;border-top:1px solid var(--line);padding-top:22px">${button(done?'Lesson Completed ✓':'Mark Lesson Complete','toggleComplete',`data-id="${uid(a.id)}"`,done?'ghost':'dark')}${button(bookmarked?'Remove Bookmark':'Save Bookmark','toggleBookmark',`data-id="${uid(a.id)}"`,'ghost')}</div></article><aside class="reader-aside"><div class="aside-card"><h4>${icon('notes')} My Private Notes</h4><textarea class="input note-editor" id="studentNote" placeholder="Write personal study notes...">${esc(db.notes[a.id]||'')}</textarea><button class="btn small-btn dark" data-act="saveNote" data-id="${uid(a.id)}" style="margin-top:10px">Save Notes</button><p class="utility">Saved on this device only. This prototype does not enforce private accounts.</p></div><div class="aside-card"><h4>Study Guidance</h4><p class="small muted">Compare passages in context, record any questions, and review the material at your own pace.</p></div></aside></div>`;}
  function testPage(){const t=get('test',ui.itemId);if(!t||t.status!=='published')return studentCourses();const answers=ui.testAnswers;return `${collectionHeading(t.title,t.description,button('Return to Course Library','nav','data-page="courses"'))}<div style="max-width:860px;margin:auto"><div class="notice">Unlimited attempts. All questions count equally. Multiple-select questions require every correct answer to be selected. No passing score is required.</div>${ui.lastResult&&ui.lastResult.testId===t.id?`<div class="result-banner"><h2 style="margin:0 0 8px">Your score: ${ui.lastResult.correct} / ${ui.lastResult.total} (${ui.lastResult.percent}%)</h2><p>Attempt saved. You may review the explanations or retake the test.</p>${button('Retake Test','retake','', 'dark')}</div>`:''}${t.questions.map((q,i)=>`<div class="card question-card"><div class="row between"><span class="eyebrow">QUESTION ${i+1} OF ${t.questions.length}</span><span class="pill">${q.type==='multiple'?'Select all that apply':'Select one'}</span></div><h3 style="font-size:17px;margin:13px 0">${esc(q.prompt)}</h3>${q.choices.map(opt=>{const selected=(answers[q.id]||[]).includes(opt.id);return `<label class="option ${selected?'checked':''}"><input type="${q.type==='multiple'?'checkbox':'radio'}" name="question-${uid(q.id)}" data-question="${uid(q.id)}" data-choice="${uid(opt.id)}" ${selected?'checked':''} ${ui.lastResult?'disabled':''}/>${esc(opt.label)}</label>`;}).join('')}${ui.lastResult&&ui.lastResult.testId===t.id?`<div class="notice" style="margin-top:12px"><strong>Correct:</strong> ${esc(q.choices.filter(x=>x.correct).map(x=>x.label).join(', '))}. ${esc(q.explanation||'')}</div>`:''}</div>`).join('')}<div class="row wrap">${button('Submit Test for Scoring','submitTest','', 'dark')}${button('Clear Answers','retake')}</div></div>`;}
  function overview(){const stat=[{label:'Published Courses',v:db.courses.filter(x=>x.status==='published').length,icon:'book'},{label:'Published Articles',v:db.articles.filter(x=>x.status==='published').length,icon:'file'},{label:'Assessments',v:db.tests.length,icon:'test'},{label:remote?(ui.persona==='admin'?'Registered Students':'Published Courses'):'Sample Student Records',v:remote?(ui.persona==='admin'?db.studentRecords.length:db.courses.filter(x=>x.status==='published').length):db.studentRecords.length,icon:'users'}];return `${collectionHeading('Management Overview','Create and organize the material for Yeshiva Bonilla.',button(icon('plus')+' New Article','newArticle','','dark'))}${remote?'':'<div class="notice">Local workspace: content changes are saved in this browser. Accounts, student records and reporting are simulated until Supabase is connected.</div>'}${statCards(stat)}<div class="split"><div class="card padded"><div class="row between"><h3 class="subtitle">Recently Updated Articles</h3>${button('Manage All','nav','data-page="admin-articles"','transparent')}</div>${db.articles.slice().reverse().slice(0,5).map(a=>listRow(a.title,a.summary,'file','editArticle',a.id,badge(a.status))).join('')}</div><div class="card padded"><h3 class="subtitle">Quick Actions</h3><div class="stack">${button(icon('plus')+' Create Article','newArticle','','ghost')}${button(icon('plus')+' Create Module','newModule','','ghost')}${button(icon('plus')+' Create Course','newCourse','','ghost')}${button(icon('plus')+' Create Test','newTest','','ghost')}</div></div></div>`;}
  function adminList(type){const plural=type+'s',kind=type[0].toUpperCase()+type.slice(1),list=db[plural];const act='edit'+kind;const create='new'+kind;return `${collectionHeading(kind+'s',`Create, organize, and publish your ${plural}.`,button(icon('plus')+' New '+kind,create,'','dark'))}<div class="card padded"><table class="admin-table"><thead><tr><th>Title</th><th>Description</th><th>Status</th><th>${type==='article'?'Updated':type==='test'?'Questions':'Items'}</th><th>Actions</th></tr></thead><tbody>${list.filter(x=>!ui.search || (x.title+' '+(x.description||x.summary||'')).toLowerCase().includes(ui.search.toLowerCase())).map(x=>`<tr><td><strong>${esc(x.title)}</strong></td><td style="max-width:360px;color:#748392">${esc((x.description||x.summary||'').slice(0,92))}</td><td>${badge(x.status)}</td><td>${type==='article'?`v${x.version||1}`:type==='test'?x.questions.length:(x.items||[]).length}</td><td>${button(icon('edit')+' Edit',act,`data-id="${uid(x.id)}"`,'ghost small-btn')}</td></tr>`).join('')||'<tr><td colspan="5">No content has been created.</td></tr>'}</tbody></table></div>`;}
  function articleEditor(){const a=get('article',ui.itemId);if(!a)return adminList('article');return `${collectionHeading('Edit Article','Write and publish independent learning resources.',`${button(icon('eye')+' Student Preview','previewArticle',`data-id="${uid(a.id)}"`)} ${button('Save Article','saveArticle','','dark')}`)}<div class="notice">${remote?'Save Article commits the resource to Supabase. Article body edits create revision history.':'Click Save Article to save changes in this browser. The demo is not a secure publishing system.'}</div><div class="card padded"><div class="grid-2"><div class="field"><label>Article Title</label><input class="input" id="artTitle" value="${esc(a.title)}" /></div><div class="field"><label>Difficulty</label><select class="input" id="artLevel">${['Beginner','Intermediate','Advanced','All levels'].map(l=>`<option ${l===a.level?'selected':''}>${l}</option>`).join('')}</select></div></div><div class="field"><label>Summary</label><textarea class="input" id="artSummary">${esc(a.summary)}</textarea></div><div class="row between wrap" style="margin-bottom:12px"><div class="subtitle" style="margin:0">Article Content</div><div class="row"><span class="small muted">Version ${a.version||1}</span><select id="artStatus" class="input" style="width:130px"><option value="draft" ${a.status==='draft'?'selected':''}>Draft</option><option value="published" ${a.status==='published'?'selected':''}>Published</option><option value="archived" ${a.status==='archived'?'selected':''}>Archived</option></select></div></div><div class="editor-toolbar"><button data-edit="formatBlock" data-val="h2" title="Heading">H2</button><button data-edit="bold" title="Bold"><b>B</b></button><button data-edit="italic" title="Italic"><i>I</i></button><button data-edit="underline" title="Underline"><u>U</u></button><button data-edit="insertUnorderedList" title="Bullet list">• List</button><button data-edit="insertOrderedList" title="Numbered list">1. List</button><button data-edit="formatBlock" data-val="blockquote" title="Quotation">❝ Quote</button><button data-edit="createLink" title="Insert external link">Link</button><button data-edit="insertImage" title="Insert image URL">Image</button><button data-edit="insertVideo" title="Insert video URL">Video</button><button data-edit="insertTable" title="Insert a table">Table</button><button data-edit="insertFile" title="Insert a document URL">Link file</button><button data-edit="insertUploaded" title="Insert uploaded media">Uploaded media</button><button data-edit="removeFormat" title="Clear formatting">Clear</button></div><div class="editor" id="richEditor" contenteditable="true" role="textbox" aria-label="Article content editor" aria-multiline="true">${sanitize(a.body)}</div><div class="row wrap" style="margin-top:18px">${button(icon('save')+' Save Changes','saveArticle','','dark')}${button(icon('eye')+' Preview Article','previewArticle',`data-id="${uid(a.id)}"`)}${button(icon('trash')+' Delete Article','deleteResource',`data-type="article" data-id="${uid(a.id)}"`,'danger')}</div></div>`;}
  function testEditor(){const t=get('test',ui.itemId);if(!t)return adminList('test');return `${collectionHeading('Test Builder','Single-select and multi-select questions with automatic grading.',`${button(icon('eye')+' Preview','previewTest',`data-id="${uid(t.id)}"`)} ${button('Save Test','saveTest','','dark')}`)}<div class="notice">${remote?'Only authorized staff can view answer keys. Students receive questions without correct answers; completed tests are graded server-side.':'Correct answers are visible in demonstration mode. In production they are stored privately and scored server-side.'}</div><div class="card padded" style="margin-bottom:18px"><div class="grid-2"><div class="field"><label>Test Title</label><input id="testTitle" class="input" value="${esc(t.title)}" /></div><div class="field"><label>Publication Status</label><select id="testStatus" class="input"><option value="draft" ${t.status==='draft'?'selected':''}>Draft</option><option value="published" ${t.status==='published'?'selected':''}>Published</option></select></div></div><div class="field"><label>Instructions / Description</label><textarea id="testDesc" class="input">${esc(t.description)}</textarea></div></div>${t.questions.map((q,i)=>`<div class="card padded" style="margin-bottom:16px"><div class="row between"><h3 class="subtitle">Question ${i+1}</h3>${button(icon('trash')+' Remove','deleteQuestion',`data-qi="${i}"`,'danger small-btn')}</div><div class="grid-2"><div class="field"><label>Question</label><input class="input" data-qp="prompt" data-qi="${i}" value="${esc(q.prompt)}" /></div><div class="field"><label>Answer Type</label><select class="input" data-qp="type" data-qi="${i}"><option value="single" ${q.type==='single'?'selected':''}>Single select</option><option value="multiple" ${q.type==='multiple'?'selected':''}>Multi select</option></select></div></div><div class="small muted" style="margin-bottom:8px">Mark the correct answer${q.type==='multiple'?'s':''} using the controls on the left.</div>${q.choices.map((c,j)=>`<div class="choice-row"><input type="${q.type==='single'?'radio':'checkbox'}" ${c.correct?'checked':''} data-answer="1" data-qi="${i}" data-ci="${j}" name="correct-${i}" aria-label="Correct option ${j+1}"/><input class="input" data-choice-label="1" data-qi="${i}" data-ci="${j}" value="${esc(c.label)}" aria-label="Choice ${j+1}" />${button(icon('trash'),'deleteChoice',`data-qi="${i}" data-ci="${j}"`,'danger small-btn')}</div>`).join('')}<div class="row wrap" style="margin-top:12px">${button(icon('plus')+' Add Choice','addChoice',`data-qi="${i}"`,'ghost small-btn')}</div><div class="field" style="margin-top:20px"><label>Answer Explanation (shown after submission)</label><textarea class="input" data-qp="explanation" data-qi="${i}">${esc(q.explanation||'')}</textarea></div></div>`).join('')}<div class="row wrap">${button(icon('plus')+' Add Question','addQuestion','','dark')}${button('Save Test','saveTest')}${button(icon('trash')+' Delete Test','deleteResource',`data-type="test" data-id="${uid(t.id)}"`,'danger')}</div>`;}
  function structureEditor(type){const x=get(type,ui.itemId);if(!x)return adminList(type);const canUse=type==='course'?['module','article','test']:['article','test'];const items=x.items||[];return `${collectionHeading(`${type==='course'?'Course':'Module'} Builder`,`Build an ordered curriculum using reusable resources.`,`${button(icon('eye')+' Preview','previewStructure',`data-type="${type}" data-id="${uid(x.id)}"`)} ${button('Save Changes','saveStructure','','dark')}`)}<div class="builder"><section class="card builder-list"><div class="subtitle">Curriculum Outline</div>${items.map((item,i)=>`<div class="builder-item">${icon(item.type==='module'?'layers':item.type==='article'?'file':'test')}<div style="flex:1;min-width:0"><strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(label(item))}</strong><span class="utility">${esc(item.type)}</span></div>${button(icon('up'),'moveItem',`data-i="${i}" data-d="-1"`,'transparent small-btn')}${button(icon('down'),'moveItem',`data-i="${i}" data-d="1"`,'transparent small-btn')}${button(icon('trash'),'removeItem',`data-i="${i}"`,'danger small-btn')}</div>`).join('')||'<p class="small muted">No items yet. Add a module, article, or test using the controls below.</p>'}<div style="background:#f7f9f9;border:1px solid var(--line);border-radius:7px;padding:13px;margin-top:18px"><label class="small" style="display:block;font-weight:700;margin-bottom:9px">Add Existing Content</label><select class="input" id="addType" style="margin-bottom:9px">${canUse.map(t=>`<option value="${t}" ${ui.addType===t?'selected':''}>${t[0].toUpperCase()+t.slice(1)}</option>`).join('')}</select><select class="input" id="addId" style="margin-bottom:10px"></select>${button(icon('plus')+' Add to '+(type==='course'?'Course':'Module'),'addContent','','dark w-full')}</div></section><section class="card builder-main"><h3 class="subtitle">${type==='course'?'Course':'Module'} Details</h3><div class="field"><label>Title</label><input id="structureTitle" class="input" value="${esc(x.title)}" /></div><div class="field"><label>Description</label><textarea class="input" id="structureDesc">${esc(x.description)}</textarea></div>${type==='course'?`<div class="field"><label>Difficulty</label><select class="input" id="structureLevel">${['Beginner','Intermediate','Advanced','All levels'].map(l=>`<option ${x.level===l?'selected':''}>${l}</option>`).join('')}</select></div>`:''}<div class="field"><label>Publication Status</label><select class="input" id="structureStatus"><option value="draft" ${x.status==='draft'?'selected':''}>Draft</option><option value="published" ${x.status==='published'?'selected':''}>Published</option><option value="archived" ${x.status==='archived'?'selected':''}>Archived</option></select></div><p class="small muted">Resources can appear in multiple places. Updating an article updates all placements. Students can navigate the order freely.</p>${button(icon('trash')+' Delete '+(type==='course'?'Course':'Module'),'deleteResource',`data-type="${type}" data-id="${uid(x.id)}"`,'danger')}</section></div>`;}
  function adminStudents(){return `${collectionHeading('Students','Student accounts and learning activity.')}<div class="notice">${remote?'Authorized student profiles and participation totals. Email addresses are not exposed in the browser.':'Sample student records. No actual student registration or individual account separation is available in local mode.'}</div><div class="card padded"><table class="admin-table"><thead><tr><th>Student</th><th>Email</th><th>Courses</th><th>Lessons Completed</th></tr></thead><tbody>${db.studentRecords.map(s=>`<tr><td><strong>${esc(s.name)}</strong></td><td>${esc(s.email)}</td><td>${esc(s.courses)}</td><td>${esc(s.completed)}</td></tr>`).join('')}</tbody></table></div>`;}
  function adminMedia(){
    return `${collectionHeading('Media Library','Staff uploads stored privately with time-limited download links.')}<div class="card padded"><h3 class="subtitle">Upload resource</h3><div class="field"><label for="mediaFile">Image, PDF, audio, or MP4 (up to 100 MB)</label><input class="input" id="mediaFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,video/mp4,audio/mpeg" /></div>${button('Upload Selected File','uploadMedia','','dark')}<p class="utility">${remote?'Private cloud storage.':'Files are stored in this browser only via IndexedDB. They are not synchronized or private from other users of this device.'} Use YouTube or Vimeo for long videos.</p></div><div class="card padded" style="margin-top:18px"><h3 class="subtitle">Uploaded files</h3>${(db.media||[]).map(m=>`<div class="row between wrap" style="gap:8px;border-bottom:1px solid var(--line);padding:10px 0"><span><strong>${esc(m.display_name)}</strong><br><span class="utility">${(m.file_size_bytes/1024/1024).toFixed(1)} MB · ${esc(m.mime_type)}</span></span><span class="row wrap">${button('Open / Download','downloadMedia',`data-id="${uid(m.storage_path)}"`,'ghost small-btn')}${button('Remove','deleteMedia',`data-id="${uid(m.storage_path)}"`,'danger small-btn')}</span></div>`).join('')||'<p class="muted">No uploaded files.</p>'}</div>`;}

  function adminReports(){const r=db.report;
    const cards=remote&&r?[{label:ui.persona==='admin'?'Registered Students':'Your Courses',v:r.students??db.courses.length,icon:'users'},
      {label:'Lesson Completions',v:r.completions,icon:'check'}, {label:'Test Attempts',v:r.attempts,icon:'test'},
      {label:'Average Test Score',v:r.averageScore===null?'—':r.averageScore+'%',icon:'chart'}]:
      [{label:'Sample Student Profiles',v:db.studentRecords.length,icon:'users'}, {label:'Local Lesson Completions',v:db.progress.length,icon:'check'},
      {label:'Local Test Attempts',v:db.attempts.length,icon:'test'}, {label:'Published Courses',v:db.courses.filter(x=>x.status==='published').length,icon:'book'}];
    const attempts=remote?(r?.recentAttempts||[]):db.attempts.slice().reverse();
    return `${collectionHeading('Learning Reports',remote?'Engagement statistics for learners you are permitted to oversee.':'Local workspace activity and sample engagement statistics.')}${statCards(cards)}<div class="card padded"><h3 class="subtitle">Recent Assessment Attempts</h3><table class="admin-table"><thead><tr><th>Test</th><th>Score</th><th>Attempt Date</th></tr></thead><tbody>${attempts.map(a=>`<tr><td>${esc(get('test',a.testId)?.title||'Test')}</td><td>${a.scorePercent}%</td><td>${new Date(a.date).toLocaleString()}</td></tr>`).join('')||'<tr><td colspan="3">No attempts yet.</td></tr>'}</tbody></table></div>`;}

  function adminSettings(){return `${collectionHeading('School Settings','Local workspace configuration and backups.')}
  <div class="split"><section class="card padded"><h3 class="subtitle">School Identity</h3>
    <div class="field"><label>School Name</label><input class="input" value="Yeshiva Bonilla" disabled /></div>
    <div class="field"><label>Tagline</label><input class="input" value="Torah · Yeshua · Faithful Living" disabled /></div>
    <div class="field"><label>External Donation Page</label><input class="input" id="donationUrl" value="${esc(db.donationUrl||'')}" placeholder="https://donations.example/..." /></div>
    ${button('Save Donation Link','saveSettings','','dark')}
    <p class="utility" style="margin-top:14px">Donations are external links. No financial information is collected in this website.</p>
  </section><section class="card padded"><h3 class="subtitle">Local Workspace & Backups</h3>
    <div class="notice"><strong>Local-only:</strong> Lessons, tests, course structures, notes, scores, and settings persist in this browser. Media files are saved in IndexedDB. This is not secure multi-user authentication, cloud sync or an off-device backup. ${storageAvailable?'Browser storage is available.':'Browser storage is not currently available: save an export immediately.'}</div>
    <p class="small muted">Export a full backup before clearing site data, changing browsers, or moving to Supabase. Full backups include media and can be large.</p>
    <div class="stack" style="margin:16px 0">
      ${button(icon('filedown')+' Export Complete Backup (including files)','exportLocalFull','','dark')}
      ${button(icon('filedown')+' Export Content Only (smaller JSON)','exportLocalData','','ghost')}
      <div class="field"><label for="backupFile">Restore From Backup (.json)</label><input class="input" type="file" accept=".json,application/json" id="backupFile" /></div>
      ${button('Import Backup (replaces current workspace)','importLocalData','','ghost')}
    </div>
    ${button('Reset Local Workspace','resetDemo','','danger')}
    <p class="utility" style="margin-top:12px">Backups contain lesson content and any saved notes or test records. Store them in a safe location.</p>
  </section></div>`;}

  const backupFormat = 'yeshiva-bonilla-local-backup';
  const backupVersion = 1;
  const fileToBase64 = blob => new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(reader.error||new Error('Could not read media file'));reader.readAsDataURL(blob);
  });
  function makeDownload(name,content){const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  async function exportLocalBackup(includeFiles){
    if(remote)return;
    try{
      const data=deepCopy(db);
      // Any temporary publication override used for previews is not a real saved status.
      if(ui._restore){const resource=data[ui._restore.type+'s']?.find(x=>x.id===ui._restore.id);if(resource)resource.status=ui._restore.status;}
      const backup={format:backupFormat,version:backupVersion,exportedAt:now(),includesMedia:includeFiles,data,mediaFiles:[]};
      if(includeFiles){
        const media=await LOCAL_MEDIA.all(),total=media.reduce((sum,x)=>sum+(x.blob?.size||0),0);
        if(total>25*1024*1024&&!confirm(`Your media files total ${(total/1048576).toFixed(1)} MB. A full JSON backup will be approximately ${Math.ceil(total*4/3/1048576)} MB. Continue?`))return;
        for(const item of media){backup.mediaFiles.push({id:item.id,name:item.name,type:item.type,base64:await fileToBase64(item.blob)});}
      }
      const date=new Date().toISOString().slice(0,10);
      makeDownload(`yeshiva-bonilla-${includeFiles?'full':'content'}-backup-${date}.json`,JSON.stringify(backup));
      toast(includeFiles?'Full local backup exported.':'Content-only backup exported. Media files are excluded.');
    }catch(e){toast('Backup failed: '+e.message);}
  }
  function validateImportedData(candidate){
    if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))throw new Error('Invalid workspace backup');
    for(const name of ['articles','modules','courses','tests','progress','bookmarks','attempts','enrollments'])if(!Array.isArray(candidate[name]))throw new Error(`Backup is missing ${name}`);
    if(!candidate.notes||typeof candidate.notes!=='object'||Array.isArray(candidate.notes))throw new Error('Backup notes have an invalid format');
    for(const name of ['articles','modules','courses','tests'])for(const x of candidate[name])if(typeof x.id!=='string'||typeof x.title!=='string'||!['published','draft','archived'].includes(x.status))throw new Error(`Invalid ${name} record`);
    if(!Array.isArray(candidate.media))candidate.media=[];
    if(!Array.isArray(candidate.studentRecords))candidate.studentRecords=[];
    if(typeof candidate.donationUrl!=='string')candidate.donationUrl='';
    candidate.schemaVersion=2;
    return candidate;
  }
  async function importLocalBackup(){
    if(remote)return;
    const file=document.getElementById('backupFile')?.files?.[0];
    if(!file){toast('Select a JSON backup first.');return;}
    if(file.size>250*1024*1024){toast('Backup file exceeds the 250 MB import limit.');return;}
    let backup,data;
    try{
      backup=JSON.parse(await file.text());
      if(backup?.format!==backupFormat||backup.version!==backupVersion)throw new Error('Unrecognized or unsupported Yeshiva Bonilla backup');
      data=validateImportedData(backup.data);
      if(!Array.isArray(backup.mediaFiles))throw new Error('Invalid media backup array');
      if(backup.mediaFiles.length>250)throw new Error('Too many media files in one backup');
      for(const media of backup.mediaFiles)if(!/^local\/[a-z0-9-]{16,120}$/i.test(media.id)||typeof media.base64!=='string'||!['image/jpeg','image/png','image/webp','image/gif','application/pdf','text/plain','video/mp4','audio/mpeg'].includes(media.type))throw new Error('Unsupported media record');
      if(!confirm('Replace ALL current local Yeshiva Bonilla content, notes, scores and files with the selected backup? Export your existing work first.'))return;
      const previousDb=db,previousAssets=await LOCAL_MEDIA.all();
      try{
        await LOCAL_MEDIA.clear();
        for(const media of backup.mediaFiles){
          const binary=atob(media.base64),bytes=new Uint8Array(binary.length);
          for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
          await LOCAL_MEDIA.put(media.id,new Blob([bytes],{type:media.type}),{name:media.name,type:media.type});
        }
        // Content-only backups do not contain underlying media assets: warn rather than fabricate files.
        db=data;save();navigate('overview');
        toast(backup.includesMedia?'Full backup restored.':'Content restored. Any referenced local media must be re-uploaded.');
      }catch(e){
        db=previousDb;try{await LOCAL_MEDIA.clear();for(const previous of previousAssets)await LOCAL_MEDIA.put(previous.id,previous.blob,{name:previous.name,type:previous.type});}catch(_){}
        save();throw e;
      }
    }catch(e){toast('Import failed: '+e.message);}
  }

  function render(){const root=document.getElementById('app');if(!root)return;document.title='Yeshiva Bonilla | '+(ui.page==='home'?'Torah Learning':ui.page.replaceAll('-',' '));if(ui.page==='home'){root.innerHTML=home();return;}if(ui.page==='login'){root.innerHTML=login();return;}if(ui.page==='passwordReset'){root.innerHTML=passwordReset();return;}if(!ui.persona){ui.page='login';root.innerHTML=login();return;}let isManage=ui.page.startsWith('admin-')||ui.page==='overview'||ui.page.endsWith('Editor');let html='';switch(ui.page){case'dashboard':html=dashboard();break;case'courses':html=studentCourses();break;case'articles':html=studentArticles();break;case'bookmarks':html=studentBookmarks();break;case'notes':html=studentNotes();break;case'results':html=studentResults();break;case'courseDetail':html=courseDetail();break;case'lesson':html=reader();break;case'test':html=testPage();break;case'overview':html=overview();break;case'admin-articles':html=adminList('article');break;case'admin-modules':html=adminList('module');break;case'admin-courses':html=adminList('course');break;case'admin-tests':html=adminList('test');break;case'admin-students':html=adminStudents();break;case'admin-media':html=adminMedia();break;case'admin-reports':html=adminReports();break;case'admin-settings':html=adminSettings();break;case'articleEditor':html=articleEditor();break;case'testEditor':html=testEditor();break;case'moduleEditor':html=structureEditor('module');break;case'courseEditor':html=structureEditor('course');break;default:html=dashboard();ui.page='dashboard';}if(isManage&&ui.persona==='student'){ui.page='dashboard';html=dashboard();isManage=false;}root.innerHTML=shell(html,isManage);if(ui.page==='courseEditor'||ui.page==='moduleEditor')fillContentChoices();if(ui.page==='lesson'||ui.page==='articleEditor')hydrateAssets();}
  function navigate(page,itemId=''){cleanObjectUrls();ui.page=page;ui.itemId=itemId;ui.mobile=false;ui.search='';ui.lastResult=null;window.scrollTo(0,0);render();}
  function enter(persona){if(!['student','instructor','admin'].includes(persona))return;ui.persona=persona;try { sessionStorage.setItem(SESSION,persona); } catch (_) {} navigate(persona==='student'?'dashboard':'overview');}
  function canManage(){return ui.persona==='admin'||ui.persona==='instructor';}
  function getTargetType(){return ui.page==='courseEditor'?'course':'module';}
  function fillContentChoices(){const type=document.getElementById('addType')?.value;if(!type)return;const items=(db[type+'s']||[]).filter(x=>!(type==='module'&&x.id===ui.itemId));const select=document.getElementById('addId');if(select){select.innerHTML=items.map(x=>`<option value="${uid(x.id)}">${esc(x.title)} (${esc(x.status)})</option>`).join('');ui.addId=items[0]?.id||'';}}
  function newItem(type){if(!canManage())return;const item={id:makeId(),title:`Untitled ${type}`,description:'',status:'draft'};if(type==='article'){item.summary='';item.body='<p>Begin writing your lesson here.</p>';item.level='Beginner';item.version=1;item.updated=now();}else if(type==='test'){item.questions=[];item.version=1;}else{item.items=[];if(type==='course')item.level='Beginner';}db[type+'s'].unshift(item);save();navigate(type+'Editor',item.id);toast('New '+type+' created.');}
  function saveArticle(){if(!canManage())return;const a=get('article',ui.itemId);if(!a)return;a.title=document.getElementById('artTitle').value.trim()||'Untitled Article';a.summary=document.getElementById('artSummary').value;a.level=document.getElementById('artLevel').value;if(ui.persona!=='admin'&&document.getElementById('artStatus').value==='published'){toast('Only administrators may publish.');return;}a.status=document.getElementById('artStatus').value;a.body=sanitize(document.getElementById('richEditor').innerHTML);a.version=(a.version||0)+1;a.updated=now();save();toast('Article saved.');render();}
  function saveTest(){if(!canManage())return;const t=get('test',ui.itemId);if(!t)return;t.title=document.getElementById('testTitle').value.trim()||'Untitled Test';t.description=document.getElementById('testDesc').value;const publishing=document.getElementById('testStatus').value==='published';if(publishing&&ui.persona!=='admin'){toast('Only administrators may publish.');return;}if(publishing&&!t.questions.length){toast('Add at least one question before publishing.');return;}for(const q of t.questions){if(q.choices.length<2||q.choices.filter(c=>c.correct).length<1||!q.prompt.trim()){toast('Every question needs a prompt, at least two choices, and a correct answer.');return;}if(q.type==='single'&&q.choices.filter(c=>c.correct).length!==1){toast('Single-select questions need exactly one correct answer.');return;}}t.status=document.getElementById('testStatus').value;t.version=(t.version||0)+1;ui.forceTestSave=true;save();toast(remote?'Test queued for secure publishing.':'Test saved.');render();}
  function saveStructure(){if(!canManage())return;const type=getTargetType(),x=get(type,ui.itemId);if(!x)return;x.title=document.getElementById('structureTitle').value.trim()||'Untitled';x.description=document.getElementById('structureDesc').value;if(ui.persona!=='admin'&&document.getElementById('structureStatus').value==='published'){toast('Only administrators may publish.');return;}x.status=document.getElementById('structureStatus').value;if(type==='course')x.level=document.getElementById('structureLevel').value;save();toast('Curriculum saved.');render();}
  function deleteResource(type,id){if(ui.persona!=='admin'){toast('Only administrators may delete content.');return;}const resource=get(type,id);if(!resource)return;if(!confirm(`Delete “${resource.title}”? Existing references will be removed from curricula. This cannot be undone in demo mode.`))return;db[type+'s']=db[type+'s'].filter(x=>x.id!==id);for(const c of [...db.courses,...db.modules])c.items=c.items.filter(x=>!(x.type===type&&x.id===id));save();navigate('admin-'+type+'s');toast('Resource deleted.');}
  const activeObjectUrls = new Set();
  function cleanObjectUrls(){for(const url of activeObjectUrls)URL.revokeObjectURL(url);activeObjectUrls.clear();}
  async function hydrateAssets(){for(const el of document.querySelectorAll('[data-yb-path]')){
    try{
      const path=el.dataset.ybPath;
      let url;
      if(remote) url=await live.downloadUrl(path);
      else {
        const asset=await LOCAL_MEDIA.get(path);
        if(!asset?.blob)throw new Error('File missing from this browser');
        url=URL.createObjectURL(asset.blob);activeObjectUrls.add(url);
      }
      if(!el.isConnected)return;
      if(el.tagName==='VIDEO'){el.src=url;el.preload='metadata';}
      else if(el.tagName==='IMG'){el.src=url;}
      else {el.href=url;el.target='_blank';el.rel='noopener noreferrer';if(!remote)el.setAttribute('download','');}
    }catch(e){el.replaceWith(document.createTextNode('[Local resource unavailable on this browser]'));}
  }}
  function insertUploadedResource(){
    const items=db.media||[];if(!items.length){toast('Upload a resource from the Media Library first.');return;}
    const numbered=items.map((m,i)=>`${i+1}. ${m.display_name} (${m.mime_type})`).join('\n');
    const choice=Number(prompt('Enter the number of a previously uploaded resource:\n'+numbered));
    if(!Number.isInteger(choice)||choice<1||choice>items.length)return;
    const asset=items[choice-1],path=esc(asset.storage_path),name=esc(asset.display_name);
    const html=asset.mime_type.startsWith('image/') ? `<p><img data-yb-path="${path}" alt="${name}" /></p>` :
      asset.mime_type==='video/mp4' ? `<video data-yb-path="${path}" controls></video><p>${name}</p>` :
      `<p><a href="#" data-yb-path="${path}">Download: ${name}</a></p>`;
    document.execCommand('insertHTML',false,html);
  }
  function chooseEdit(button){const ed=document.getElementById('richEditor');if(!ed)return;ed.focus();const op=button.dataset.edit;const val=button.dataset.val;if(op==='insertUploaded'){insertUploadedResource();return;}if(op==='insertVideo'||op==='insertImage'||op==='createLink'||op==='insertFile'){
      const url=prompt(op==='insertVideo'?'Paste a YouTube or Vimeo URL:':op==='insertImage'?'Paste an image URL:':'Paste an HTTPS URL:');if(!url)return;const safe=safeLink(url);if(!safe){toast('Only http or https links are allowed.');return;}
      if(op==='insertImage')document.execCommand('insertHTML',false,`<img src="${esc(safe)}" alt="Lesson image" />`);
      else if(op==='insertVideo'){
        const embed=trustedEmbedUrl(safe);
        if(embed){
          document.execCommand('insertHTML',false,`<div><iframe src="${esc(embed)}" title="Lesson video" loading="lazy" allowfullscreen></iframe></div><p></p>`);
          toast('Video embed added.');
        } else {
          document.execCommand('insertHTML',false,`<p><a href="${esc(safe)}" target="_blank">Video lesson: ${esc(safe)}</a></p>`);
          toast('Added as a video link. Uploaded videos require connected storage.');
        }
      } else if(op==='insertFile')document.execCommand('insertHTML',false,`<p><a href="${esc(safe)}" target="_blank">Download resource</a></p>`);
      else document.execCommand('createLink',false,safe);
    }else if(op==='insertTable')document.execCommand('insertHTML',false,'<table><tbody><tr><th>Column A</th><th>Column B</th></tr><tr><td>Example</td><td>Example</td></tr></tbody></table><p></p>');
    else document.execCommand(op,false,val||null);
  }
  function handleAction(event){const button=event.target.closest('[data-act]');if(!button)return;if(button.tagName==='A')event.preventDefault();const act=button.dataset.act,id=button.dataset.id;
    const navStaff=['admin-articles','admin-modules','admin-courses','admin-tests','admin-students','admin-media','admin-reports','admin-settings','overview'];
    if((act.startsWith('edit')||act.startsWith('new')||['saveArticle','saveTest','saveStructure','deleteResource','addContent','removeItem','moveItem','addQuestion','deleteQuestion','addChoice','deleteChoice','saveSettings','resetDemo','exportLocalData','exportLocalFull','importLocalData','deleteMedia'].includes(act))&&!canManage()){toast('Instructor or administrator access required.');return;}
    switch(act){case'goHome':navigate('home');break;case'login':navigate('login');break;case'scrollAbout':navigate('home');setTimeout(()=>document.getElementById('about')?.scrollIntoView({behavior:'smooth'}),0);break;case'scrollCourses':if(ui.page!=='home')navigate('home');setTimeout(()=>document.getElementById('courses')?.scrollIntoView({behavior:'smooth'}),0);break;case'enter':enter(button.dataset.role);break;case'logout':if(remote){(async()=>{try{await live.signOut();db=blank();lastSynced=deepCopy(db);ui.persona='';navigate('home');}catch(e){toast(e.message);}})();break;}ui.persona='';try { sessionStorage.removeItem(SESSION); } catch (_) {} navigate('home');break;case'toggleMenu':ui.mobile=!ui.mobile;render();break;
    case'nav':if(navStaff.includes(button.dataset.page)&&(!canManage()||(ui.persona!=='admin'&&['admin-settings','admin-students'].includes(button.dataset.page)))){toast('Staff only.');break;}navigate(button.dataset.page);break;
    case'switchPortal':if(canManage())navigate(ui.page.startsWith('admin-')||ui.page==='overview'||ui.page.endsWith('Editor')?'dashboard':'overview');break;
    case'courseDetail':if(!ui.persona){navigate('login');break;}navigate('courseDetail',id);break;
    case'openArticle':navigate('lesson',id);break;case'openTest':ui.testAnswers={};if(remote){(async()=>{try{const t=get('test',id),data=await live.getStudentTest(id);if(t)t.questions=data.questions;navigate('test',id);}catch(e){toast(e.message);}})();break;}navigate('test',id);break;
    case'enroll':if(!db.enrollments.includes(id)){db.enrollments.push(id);save();toast('Course added to My Learning.');}render();break;
    case'toggleComplete':db.progress=db.progress.includes(id)?db.progress.filter(x=>x!==id):[...db.progress,id];save();render();toast(db.progress.includes(id)?'Lesson marked complete.':'Completion removed.');break;
    case'toggleBookmark':db.bookmarks=db.bookmarks.includes(id)?db.bookmarks.filter(x=>x!==id):[...db.bookmarks,id];save();render();break;
    case'saveNote':db.notes[id]=document.getElementById('studentNote').value;save();toast(remote?'Private note queued for cloud save.':'Private note saved locally.');break;
    case'submitTest':if(remote){submitRemoteTest();break;}submitTest();break;case'retake':ui.testAnswers={};ui.lastResult=null;render();break;
    case'uploadMedia':uploadMedia();break;case'downloadMedia':downloadMedia(id);break;case'deleteMedia':if(!remote)deleteLocalMedia(id);break;case'toggleRegister':toggleRegister();break;case'forgotPassword':forgotPassword();break;
    case'newArticle':newItem('article');break;case'newTest':newItem('test');break;case'newCourse':newItem('course');break;case'newModule':newItem('module');break;
    case'editArticle':navigate('articleEditor',id);break;case'editTest':if(remote){(async()=>{try{const t=get('test',id),data=await live.getAuthorTest(id);if(t)t.questions=data.questions||[];navigate('testEditor',id);}catch(e){toast(e.message);}})();break;}navigate('testEditor',id);break;case'editCourse':ui.addType='module';navigate('courseEditor',id);break;case'editModule':ui.addType='article';navigate('moduleEditor',id);break;
    case'saveArticle':saveArticle();break;case'saveTest':saveTest();break;case'saveStructure':saveStructure();break;
    case'deleteResource':deleteResource(button.dataset.type,id);break;
    case'previewArticle':{const a=get('article',id);if(a){const original=a.status;a.status='published';ui._restore={type:'article',id,status:original};navigate('lesson',id);toast('Temporary visual preview; publication state is unchanged.');}break;}
    case'previewTest':{const t=get('test',id);if(t){const original=t.status;t.status='published';ui._restore={type:'test',id,status:original};ui.testAnswers={};navigate('test',id);}break;}
    case'previewStructure':{const type=button.dataset.type,x=get(type,id);if(type==='course'){const original=x.status;x.status='published';ui._restore={type,id,status:original};navigate('courseDetail',id);}else toast('Preview this module by adding it to a course.');break;}
    case'addContent':{const type=getTargetType(),x=get(type,ui.itemId),childType=document.getElementById('addType').value,childId=document.getElementById('addId').value;if(!childId){toast('Select a resource first.');break;}if(x.items.some(i=>i.type===childType&&i.id===childId)){toast('This resource is already in the outline.');break;}x.items.push({type:childType,id:childId});save();render();toast('Added to curriculum.');break;}
    case'moveItem':{const x=get(getTargetType(),ui.itemId);const i=+button.dataset.i,j=i+(+button.dataset.d);if(j<0||j>=x.items.length)break;[x.items[i],x.items[j]]=[x.items[j],x.items[i]];save();render();break;}
    case'removeItem':{const x=get(getTargetType(),ui.itemId);x.items.splice(+button.dataset.i,1);save();render();break;}
    case'addQuestion':{const t=get('test',ui.itemId);t.questions.push({id:makeId(),type:'single',prompt:'',explanation:'',choices:[{id:makeId(),label:'Option 1',correct:true},{id:makeId(),label:'Option 2',correct:false}]});save();render();break;}
    case'deleteQuestion':{const t=get('test',ui.itemId);t.questions.splice(+button.dataset.qi,1);save();render();break;}
    case'addChoice':{const q=get('test',ui.itemId).questions[+button.dataset.qi];q.choices.push({id:makeId(),label:'New option',correct:false});save();render();break;}
    case'deleteChoice':{const q=get('test',ui.itemId).questions[+button.dataset.qi];if(q.choices.length<=2){toast('A question needs at least two choices.');break;}q.choices.splice(+button.dataset.ci,1);save();render();break;}
    case'exportLocalData':exportLocalBackup(false);break;case'exportLocalFull':exportLocalBackup(true);break;case'importLocalData':importLocalBackup();break;case'saveSettings':{if(ui.persona!=='admin'){toast('Administrator permission required.');break;}const url=document.getElementById('donationUrl').value.trim();if(url&&!safeLink(url)){toast('Enter a valid http or https donation URL.');break;}db.donationUrl=url;save();toast(remote?'Donation URL queued for cloud save.':'Donation URL saved locally.');break;}
    case'resetDemo':if(remote){toast('Not available for live data.');break;}
      if(confirm('Reset the local workspace? This clears content, notes, progress, scores AND uploaded files. Make a full backup first.')){
        (async()=>{try{await LOCAL_MEDIA.clear();db=seed();db.media=[];save();navigate('overview');toast('Local workspace reset.');}catch(e){toast('Could not reset local media: '+e.message);}})();
      }break;
    case'donate':{if(!db.donationUrl){toast('Donation page not yet configured. No payment will be collected.');break;}window.open(safeLink(db.donationUrl),'_blank','noopener,noreferrer');break;}
  }}
  async function submitRemoteTest(){const t=get('test',ui.itemId);if(!t)return;
    for(const q of t.questions)if(!(ui.testAnswers[q.id]||[]).length){toast('Answer every question before submitting.');return;}
    try {const r=await live.submitTest(t.id,ui.testAnswers);ui.lastResult={testId:t.id,correct:r.correct,total:r.total,percent:r.percent};
      for(const q of t.questions){const review=r.review.find(x=>x.question_id===q.id);if(review){q.explanation=review.explanation;q.choices.forEach(c=>c.correct=review.correct_choices.includes(c.id));}}
      db.attempts.push({id:r.attempt_id,testId:t.id,testVersion:t.version,correct:r.correct,total:r.total,scorePercent:Number(r.percent),date:now(),responses:deepCopy(ui.testAnswers)});
      lastSynced.attempts=deepCopy(db.attempts);render();scrollTo({top:0,behavior:'smooth'});
    }catch(e){toast('Could not submit test: '+e.message);}}
  async function uploadMedia(){
    const file=document.getElementById('mediaFile')?.files?.[0];if(!file){toast('Select a file first.');return;}
    try{
      if(remote){toast('Uploading file...');await live.upload(file);db=await live.load();lastSynced=deepCopy(db);render();toast('File uploaded.');return;}
      LOCAL_MEDIA.validateFile(file);
      const path='local/'+makeId();
      await LOCAL_MEDIA.put(path,file,{name:file.name,type:file.type});
      db.media ||= [];
      db.media.unshift({id:path,storage_path:path,display_name:file.name,mime_type:file.type,file_size_bytes:file.size,created_at:now()});
      save();render();toast('File saved in this browser. Back up your workspace regularly.');
    }catch(e){toast('File save failed: '+e.message);}
  }
  async function downloadMedia(path){try{
    if(remote){const url=await live.downloadUrl(path);window.open(url,'_blank','noopener,noreferrer');return;}
    const asset=await LOCAL_MEDIA.get(path);if(!asset?.blob)throw new Error('File not available on this browser');
    const url=URL.createObjectURL(asset.blob),a=document.createElement('a');a.href=url;a.download=asset.name||'download';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(e){toast('Could not open file: '+e.message);}}
  async function deleteLocalMedia(path){
    if(ui.persona!=='admin'){toast('Administrator permission required.');return;}
    if(!confirm('Permanently remove this browser-local file? References in articles will stop working.'))return;
    try{await LOCAL_MEDIA.remove(path);db.media=db.media.filter(m=>m.storage_path!==path);save();render();toast('Local file removed.');}
    catch(e){toast('Could not remove file: '+e.message);}
  }
  let registering=false;
  function toggleRegister(){registering=!registering;const wrap=document.getElementById('authNameWrap');if(wrap)wrap.hidden=!registering;
    const btn=document.getElementById('authSubmit');if(btn)btn.textContent=registering?'Register Free Account':'Sign In';
    const link=document.querySelector('[data-act="toggleRegister"]');if(link)link.textContent=registering?'Already registered? Sign In':'Create a free account';}
  function passwordReset(){return `<div class="auth-layout"><div class="auth-side">${brand()}<h1>Secure your account.</h1><p>Choose a new password to continue your studies.</p></div><div class="auth-form"><h2>Set a new password</h2><form id="resetForm" class="stack"><div class="field"><label for="newPassword">New password</label><input id="newPassword" type="password" minlength="8" required class="input" /></div><button type="submit" class="btn dark">Save New Password</button></form></div></div>`;}
  async function forgotPassword(){const email=document.getElementById('authEmail')?.value.trim();if(!email){toast('Enter your email address first.');return;}
    try{await live.resetPassword(email);toast('Check your email for a password-reset link.');}catch(e){toast(e.message);}}
  function submitTest(){const t=get('test',ui.itemId);if(!t||!t.questions.length){toast('No questions to score.');return;}for(const q of t.questions){if(!(ui.testAnswers[q.id]||[]).length){toast('Please answer every question before submitting.');return;}}let correct=0;for(const q of t.questions){const selected=(ui.testAnswers[q.id]||[]).slice().sort().join('|'),right=q.choices.filter(c=>c.correct).map(c=>c.id).sort().join('|');if(selected===right)correct++;}const result={id:makeId(),testId:t.id,testVersion:t.version,correct,total:t.questions.length,scorePercent:Math.round(correct/t.questions.length*100),date:now(),responses:JSON.parse(JSON.stringify(ui.testAnswers))};db.attempts.push(result);ui.lastResult={testId:t.id,correct,total:result.total,percent:result.scorePercent};save();render();window.scrollTo({top:0,behavior:'smooth'});}
  function onChange(event){const el=event.target;
    if(el.matches('[data-question]')){const question=el.dataset.question,choice=el.dataset.choice,t=get('test',ui.itemId),q=t?.questions.find(x=>x.id===question);if(!q)return;const prev=ui.testAnswers[question]||[];ui.testAnswers[question]=q.type==='single'?[choice]:el.checked?[...prev.filter(x=>x!==choice),choice]:prev.filter(x=>x!==choice);render();return;}
    if(el.id==='addType'){ui.addType=el.value;fillContentChoices();return;}if(el.id==='addId'){ui.addId=el.value;return;}
    if(el.dataset.qp){get('test',ui.itemId).questions[+el.dataset.qi][el.dataset.qp]=el.value;if(el.dataset.qp==='type'&&el.value==='single'){const q=get('test',ui.itemId).questions[+el.dataset.qi];let seen=false;q.choices.forEach(c=>{if(c.correct){if(seen)c.correct=false;seen=true;}});}save();if(el.dataset.qp==='type')render();return;}
    if(el.dataset.choiceLabel){get('test',ui.itemId).questions[+el.dataset.qi].choices[+el.dataset.ci].label=el.value;save();return;}
    if(el.dataset.answer){const q=get('test',ui.itemId).questions[+el.dataset.qi];if(q.type==='single')q.choices.forEach((c,j)=>c.correct=j==+el.dataset.ci);else q.choices[+el.dataset.ci].correct=el.checked;save();return;}
  }
  window.addEventListener('yb-password-recovery',()=>{ui.page='passwordReset';render();});
  document.addEventListener('submit',event=>{if(event.target.id==='resetForm'){event.preventDefault();(async()=>{try{await live.changePassword(document.getElementById('newPassword').value);toast('Password updated.');navigate('dashboard');}catch(e){toast(e.message);}})();return;}if(event.target.id!=='liveAuthForm')return;event.preventDefault();
    const email=document.getElementById('authEmail')?.value.trim(),password=document.getElementById('authPassword')?.value,name=document.getElementById('authName')?.value.trim();
    const btn=document.getElementById('authSubmit');if(btn)btn.disabled=true;
    (async()=>{try{if(registering){const result=await live.signUp(email,password,name);if(result.confirmationRequired){toast('Check your email to confirm your account.');return;}}
      else await live.signIn(email,password);await reloadRemote();}catch(e){const info=document.getElementById('authNotice');if(info){info.hidden=false;info.textContent=e.message;}}finally{if(btn)btn.disabled=false;}})();
  });
  document.addEventListener('click',event=>{if(event.target.closest('[data-edit]')){event.preventDefault();chooseEdit(event.target.closest('[data-edit]'));return;}handleAction(event);});
  document.addEventListener('change',onChange);
  document.addEventListener('input',event=>{if(event.target.id==='quickSearch'){ui.search=event.target.value;/* filtering after Enter, to preserve focus */}});
  document.addEventListener('keydown',event=>{if(event.target.id==='quickSearch'&&event.key==='Enter'){event.preventDefault();render();}});
  // Reset any temporary draft-preview publication overrides when leaving the resource.
  const oldNavigate=navigate;navigate=(page,id='')=>{if(ui._restore&&!(page==='lesson'||page==='test'||page==='courseDetail')){const r=ui._restore;const entity=get(r.type,r.id);if(entity)entity.status=r.status;ui._restore=null;}oldNavigate(page,id);};
  render();
  if(remote)reloadRemote().catch(e=>{console.error('Supabase initialization failed',e);ui.page='login';render();toast('Could not connect to school database: '+e.message);});
})();