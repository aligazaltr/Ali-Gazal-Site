/* Isolated WebGL opening. No dependencies or network services. */
(function heroController(){
  const root=document.querySelector('[data-hero-direction]'),M=window.AG_HERO_DIRECTION;
  if(!root||!M)return;
  root.dataset.heroMode='static';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const stage=root.querySelector('.ho-stage'),canvas=root.querySelector('.ho-canvas'),image=root.querySelector('.ho-media img');
  const copy=root.querySelector('.ho-copy'),detail=root.querySelector('.ho-continuation');
  const skip=root.querySelector('.ho-skip'),replay=root.querySelector('.ho-replay');
  const project=window.AG_SITE_DATA?.projects?.machiavelli;
  if(project&&window.AG_VIDEO_LINKS){
    const url=window.AG_VIDEO_LINKS.publishedUrl(project.video);
    for(const link of root.querySelectorAll('.ho-cover-link,.ho-watch')){
      link.href=url||project.slug+'.html';
      if(!url){link.removeAttribute('target');link.removeAttribute('rel');link.removeAttribute('aria-label');}
    }
    if(!url)root.querySelector('.ho-watch').textContent='Deney dosyasını incele';
  }
  const readable=()=>parseFloat(getComputedStyle(document.documentElement).fontSize)<=20;
  if(reduced.matches||navigator.connection?.saveData||!readable()||window.innerHeight<700)return;
  let gl,program,texture,meshes=[],uniforms,geometry,raf=0,seconds=0,last=0,lastDraw=0;
  let visible=true,alive=false,travel=1,start=0,observer,themeObserver;
  function cancelFrame(){if(raf)window.cancelAnimationFrame(raf);raf=0;last=0;}
  function release(){
    if(!gl||gl.isContextLost())return;
    meshes.forEach(mesh=>gl.deleteBuffer(mesh.buffer));
    if(texture)gl.deleteTexture(texture);
    if(program)gl.deleteProgram(program);
    meshes=[];texture=null;program=null;
  }
  function fallback(){
    alive=false;cancelFrame();root.classList.remove('ho-live');root.dataset.heroMode='static';
    stage.removeAttribute('style');copy.style.removeProperty('visibility');detail.style.removeProperty('visibility');
    detail.inert=false;skip.hidden=true;replay.hidden=true;
    observer?.disconnect();themeObserver?.disconnect();release();canvas.width=1;canvas.height=1;
  }
  const vertex=String.raw`
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aUV;
    uniform mat4 uVP;
    uniform vec2 uOffset;
    varying vec3 vWorld;
    varying vec3 vNormal;
    varying vec2 vUV;
    void main(){
      vWorld=aPosition;vNormal=aNormal;vUV=aUV;
      gl_Position=uVP*vec4(aPosition,1.0);
      gl_Position.xy+=uOffset*gl_Position.w;
    }`;
  const fragment=String.raw`
    precision mediump float;
    uniform sampler2D uTexture;
    uniform vec3 uColor;
    uniform vec3 uBg;
    uniform vec3 uEye;
    uniform float uKind;
    uniform float uReveal;
    uniform float uKey;
    uniform float uLight;
    varying vec3 vWorld;
    varying vec3 vNormal;
    varying vec2 vUV;
    void main(){
      vec3 normal=normalize(vNormal);
      vec3 keyPosition=mix(vec3(-4.0,6.0,3.0),vec3(-1.5,5.0,6.0),uReveal);
      vec3 toKey=normalize(keyPosition-vWorld);
      vec3 toRim=normalize(vec3(5.0,3.0,-4.0)-vWorld);
      float diffuse=max(dot(normal,toKey),0.0);
      float rim=max(dot(normal,toRim),0.0);
      vec3 viewDirection=normalize(uEye-vWorld);
      float specular=pow(max(dot(normal,normalize(toKey+viewDirection)),0.0),28.0);
      vec3 amber=vec3(1.0,0.55,0.25);
      vec3 color=uColor*(0.28+diffuse*uKey*0.95+rim*0.36)+amber*specular*uKey*0.38;
      if(uKind>0.5&&uKind<1.5){
        vec3 source=texture2D(uTexture,vUV).rgb;
        float sweepPosition=(vUV.x+vUV.y*0.22-(uReveal*1.65-0.25))/0.18;
        float sweep=exp(-sweepPosition*sweepPosition);
        float exposure=mix(0.10,1.0,smoothstep(0.0,0.88,uReveal));
        color=source*(exposure+sweep*(1.0-uReveal)*0.55);
      }
      if(uKind>1.5){
        vec2 q=vec2(vWorld.x/5.2,(vWorld.z-0.2)/3.2);
        float pool=exp(-dot(q,q))*uKey;
        float sx=vWorld.x/3.3,sz=(vWorld.z+0.25)/0.85;
        float shadow=exp(-sx*sx*sx*sx-sz*sz);
        color=uBg+amber*pool*mix(0.075,0.035,uLight);
        color=mix(color,uBg*mix(0.48,0.82,uLight),shadow*0.65);
        float fog=smoothstep(5.5,15.0,length(vWorld.xz));
        color=mix(color,uBg,fog);
      }
      gl_FragColor=vec4(color,1.0);
    }`;
  function shader(type,source){
    const object=gl.createShader(type);if(!object)throw Error('Shader allocation');
    gl.shaderSource(object,source);gl.compileShader(object);
    if(!gl.getShaderParameter(object,gl.COMPILE_STATUS)){
      const message=gl.getShaderInfoLog(object);gl.deleteShader(object);throw Error(message||'Shader compile');
    }
    return object;
  }
  function quad(points,normal){
    const uv=[[0,0],[1,0],[1,1],[0,1]],out=[];
    for(const i of [0,1,2,0,2,3])out.push(...points[i],...normal,...uv[i]);
    return out;
  }
  function box(width,height,depth,cx,cy,cz){
    const x=cx-width/2,X=cx+width/2,y=cy-height/2,Y=cy+height/2,z=cz-depth/2,Z=cz+depth/2;
    return [
      ...quad([[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]],[0,0,1]),
      ...quad([[X,y,z],[x,y,z],[x,Y,z],[X,Y,z]],[0,0,-1]),
      ...quad([[X,y,Z],[X,y,z],[X,Y,z],[X,Y,Z]],[1,0,0]),
      ...quad([[x,y,z],[x,y,Z],[x,Y,Z],[x,Y,z]],[-1,0,0]),
      ...quad([[x,Y,Z],[X,Y,Z],[X,Y,z],[x,Y,z]],[0,1,0]),
      ...quad([[x,y,z],[X,y,z],[X,y,Z],[x,y,Z]],[0,-1,0])
    ];
  }
  function mesh(vertices,kind,color){
    const buffer=gl.createBuffer();if(!buffer)throw Error('Buffer allocation');
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    meshes.push({buffer,count:vertices.length/8,kind,color});
  }
  function setupGPU(){
    gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
    if(!gl)throw Error('No WebGL');
    const v=shader(gl.VERTEX_SHADER,vertex),f=shader(gl.FRAGMENT_SHADER,fragment);
    program=gl.createProgram();if(!program)throw Error('Program allocation');
    gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);
    gl.deleteShader(v);gl.deleteShader(f);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'Shader link');
    gl.useProgram(program);
    const position=gl.getAttribLocation(program,'aPosition'),normal=gl.getAttribLocation(program,'aNormal'),uv=gl.getAttribLocation(program,'aUV');
    uniforms={position,normal,uv};
    for(const name of ['VP','Offset','Texture','Color','Bg','Eye','Kind','Reveal','Key','Light'])uniforms[name]=gl.getUniformLocation(program,'u'+name);
    texture=gl.createTexture();if(!texture)throw Error('Texture allocation');
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    gl.uniform1i(uniforms.Texture,0);
    mesh(quad([[-30,-2,30],[30,-2,30],[30,-2,-30],[-30,-2,-30]],[0,1,0]),2,[.04,.045,.05]);
    mesh(box(6.6,.24,1.9,0,-1.87,-.08),0,[.12,.125,.13]);
    mesh(box(6.05,3.5,.30,0,0,-.06),0,[.075,.08,.09]);
    mesh(box(6.05,.027,.33,0,1.746,-.055),0,[.31,.23,.15]);
    mesh(quad(M.coverCorners,[0,0,1]),1,[1,1,1]);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
    gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(normal);gl.enableVertexAttribArray(uv);
  }
  function theme(){
    const name=document.documentElement.dataset.theme;
    const light=name==='light'||(!name&&window.matchMedia('(prefers-color-scheme: light)').matches);
    return {light,bg:light?[244/255,240/255,233/255]:[11/255,14/255,17/255]};
  }
  function resize(){
    if(!alive)return;
    if(reduced.matches||!readable()||window.innerHeight<700){fallback();return;}
    geometry=M.layout(stage.clientWidth,stage.clientHeight);
    if(geometry.fit>48){fallback();return;}
    const pixelCap=geometry.mobile?1250000:2100000;
    const dpr=Math.min(window.devicePixelRatio||1,geometry.mobile?1.5:1.75,Math.sqrt(pixelCap/(geometry.width*geometry.height)));
    canvas.width=Math.max(1,Math.round(geometry.width*dpr));canvas.height=Math.max(1,Math.round(geometry.height*dpr));
    gl.viewport(0,0,canvas.width,canvas.height);
    start=window.scrollY+root.getBoundingClientRect().top;
    travel=Math.max(1,root.offsetHeight-stage.clientHeight);
    request();
  }
  function render(){
    if(!alive||!geometry||gl.isContextLost())return;
    const progress=M.clamp((window.scrollY-start)/travel),s=M.sample(seconds,progress,geometry),palette=theme();
    gl.clearColor(...palette.bg,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(uniforms.VP,false,new Float32Array(s.vp));
    gl.uniform2fv(uniforms.Offset,new Float32Array(s.offset));gl.uniform3fv(uniforms.Eye,new Float32Array(s.eye));
    gl.uniform3fv(uniforms.Bg,new Float32Array(palette.bg));gl.uniform1f(uniforms.Light,palette.light?1:0);
    gl.uniform1f(uniforms.Reveal,s.reveal);gl.uniform1f(uniforms.Key,s.key);
    for(const item of meshes){
      gl.bindBuffer(gl.ARRAY_BUFFER,item.buffer);
      gl.vertexAttribPointer(uniforms.position,3,gl.FLOAT,false,32,0);
      gl.vertexAttribPointer(uniforms.normal,3,gl.FLOAT,false,32,12);
      gl.vertexAttribPointer(uniforms.uv,2,gl.FLOAT,false,32,24);
      gl.uniform1f(uniforms.Kind,item.kind);gl.uniform3fv(uniforms.Color,new Float32Array(item.color));
      gl.drawArrays(gl.TRIANGLES,0,item.count);
    }
    const values={
      '--ho-title-reveal':s.titleReveal,'--ho-title-y':s.titleLift+'px','--ho-title-z':s.titleDepth+'px',
      '--ho-title-opacity':s.titleOpacity,'--ho-detail':s.detailReveal,'--ho-continuation':s.continuation,
      '--ho-media-left':((s.bounds.left+1)*50)+'%','--ho-media-top':((1-s.bounds.top)*50)+'%',
      '--ho-media-width':((s.bounds.right-s.bounds.left)*50)+'%','--ho-media-height':((s.bounds.top-s.bounds.bottom)*50)+'%'
    };
    for(const [key,value]of Object.entries(values))stage.style.setProperty(key,String(value));
    copy.style.visibility=s.titleOpacity===0?'hidden':'visible';
    detail.style.visibility=s.continuation===0?'hidden':'visible';detail.inert=s.continuation<.98;
    skip.hidden=seconds>=6;replay.hidden=seconds<6||progress>.005;
    root.dataset.heroSeconds=seconds.toFixed(3);root.dataset.heroProgress=progress.toFixed(4);
    root.dataset.heroBeat=progress>.005?'scroll':seconds<1?'prelude':seconds<2.5?'question':seconds<4.5?'cover':'settle';
  }
  function frame(now){
    raf=0;if(!alive||!visible||document.hidden){last=0;return;}
    if(last)seconds=Math.min(6,seconds+Math.min(now-last,80)/1000);
    last=now;
    if(!lastDraw||now-lastDraw>=(geometry.mobile?1000/30:1000/60)-1||seconds>=6){render();lastDraw=now;}
    if(seconds<6)request();else last=0;
  }
  function request(){if(alive&&visible&&!document.hidden&&!raf)raf=window.requestAnimationFrame(frame);}
  function finishIntro(){seconds=6;last=0;request();}
  function init(){
    if(alive||!image.complete||!image.naturalWidth)return;
    try{
      setupGPU();alive=true;
      root.classList.add('ho-live');root.dataset.heroMode='webgl';
      resize();if(!alive)return;
      if(window.scrollY>start+4)seconds=6;
      render();
      if(gl.getError()!==gl.NO_ERROR)throw Error('First frame WebGL validation');
      request();
    }catch(error){console.warn('Hero direction: static fallback.',error);fallback();}
  }
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
  image.addEventListener('error',fallback,{once:true});
  if(image.complete)init();else image.addEventListener('load',init,{once:true});
  window.addEventListener('scroll',()=>{
    if(!alive)return;
    if(window.scrollY>start+4)seconds=6;
    request();
  },{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('orientationchange',resize,{passive:true});
  window.addEventListener('pageshow',()=>{if(alive)resize();});
  window.addEventListener('pagehide',event=>{cancelFrame();if(!event.persisted)fallback();});
  document.addEventListener('visibilitychange',()=>{cancelFrame();if(!document.hidden)request();});
  reduced.addEventListener?.('change',()=>{if(reduced.matches)fallback();});
  skip.addEventListener('click',finishIntro);
  replay.addEventListener('click',()=>{if(!alive||window.scrollY>start+4)return;seconds=0;last=0;lastDraw=0;request();});
  root.addEventListener('focusin',event=>{if(event.target.closest('a'))finishIntro();});
  if('IntersectionObserver' in window){
    observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();else cancelFrame();});
    observer.observe(root);
  }
  themeObserver=new MutationObserver(request);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();
