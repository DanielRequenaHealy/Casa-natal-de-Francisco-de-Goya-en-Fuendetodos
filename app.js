(function () {
  'use strict';
  var points = window.FICHAS || [];
  var canvas = document.getElementById('panorama');
  var missing = document.getElementById('missing');
  var gl = canvas.getContext('webgl', { antialias: false });
  var state = { yaw: 0, pitch: 0, fov: 75, index: 0, texture: null, dragging: false, x: 0, y: 0, request: 0 };
  var program, position, uv, aspect, yaw, pitch, fov, texture;
  if (gl) {
    var vertex = 'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
    var fragment = 'precision mediump float;varying vec2 v;uniform sampler2D tex;uniform float aspect,yaw,pitch,fov;const float PI=3.141592653589793;void main(){float t=tan(fov*.5);vec3 r=normalize(vec3((v.x*2.-1.)*t*aspect,(v.y*2.-1.)*t,-1.));float cp=cos(pitch),sp=sin(pitch);r=vec3(r.x,r.y*cp-r.z*sp,r.y*sp+r.z*cp);float cy=cos(yaw),sy=sin(yaw);r=vec3(r.x*cy-r.z*sy,r.y,r.x*sy+r.z*cy);vec2 p=vec2(fract(.5+atan(r.x,-r.z)/(2.*PI)),1.-acos(clamp(r.y,-1.,1.))/PI);gl_FragColor=texture2D(tex,p);}';
    function shader(type, code) { var s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); return s; }
    try {
      program = gl.createProgram(); gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex)); gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program); position = gl.getAttribLocation(program, 'a'); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      uv = gl.getUniformLocation(program,'tex'); aspect=gl.getUniformLocation(program,'aspect'); yaw=gl.getUniformLocation(program,'yaw'); pitch=gl.getUniformLocation(program,'pitch'); fov=gl.getUniformLocation(program,'fov'); gl.uniform1i(uv,0);
    } catch (e) { gl = null; }
  }
  function draw() {
    if (!gl || !state.texture) return;
    var width = Math.max(1,Math.round(canvas.clientWidth*devicePixelRatio)); var height = Math.max(1,Math.round(canvas.clientHeight*devicePixelRatio));
    if (canvas.width !== width || canvas.height !== height) { canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height); }
    gl.uniform1f(aspect,width/height); gl.uniform1f(yaw,state.yaw); gl.uniform1f(pitch,state.pitch); gl.uniform1f(fov,state.fov*Math.PI/180); gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,state.texture);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  function rich(node, content) {
    var chunks=String(content||'').split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[a-zA-Z]\]|\[\d+\])/g);
    chunks.forEach(function (chunk) {
      if (!chunk) return;
      var tag = /^\*\*.*\*\*$/.test(chunk) ? 'strong' : /^\*.*\*$/.test(chunk) ? 'em' : /^\[[a-zA-Z0-9]+\]$/.test(chunk) ? 'span' : '';
      if (!tag) { node.appendChild(document.createTextNode(chunk)); return; }
      var piece=document.createElement(tag);if(tag==='span')piece.className='inline-ref';piece.textContent=tag==='strong'?chunk.slice(2,-2):tag==='em'?chunk.slice(1,-1):chunk;node.appendChild(piece);
    });
  }
  function renderContent(point) {
    var body=document.getElementById('story-body');body.replaceChildren();
    document.getElementById('story-title').textContent=point.titulo;
    document.getElementById('point-number').textContent=String(point.numero).padStart(2,'0');
    document.getElementById('counter').textContent=String(point.numero).padStart(2,'0')+' / '+String(points.length).padStart(2,'0');
    document.getElementById('example-note').hidden=point.numero===9;
    (point.bloques||[]).forEach(function (block) {
      if (block.tipo==='texto'||block.tipo==='subtitulo') { var el=document.createElement(block.tipo==='texto'?'p':'h3');rich(el,block.texto);body.appendChild(el); }
      else if(block.tipo==='imagen') {
        var fig=document.createElement('figure');if(block.referencia){var ref=document.createElement('span');ref.className='figure-ref';ref.textContent='['+block.referencia+']';fig.appendChild(ref);}
        if(block.codigo){var code=document.createElement('div');code.className='file-ref';code.textContent='['+block.codigo+']';fig.appendChild(code);}
        var visual=document.createElement('div');visual.className='photo';visual.textContent='Imagen pendiente · '+(block.codigo||'');
        if(block.url){var img=new Image();img.alt=block.pie||'Documento gráfico';img.loading='lazy';img.onload=function(){visual.replaceChildren(img);};img.src=block.url;}
        fig.appendChild(visual);if(block.pie){var caption=document.createElement('figcaption');rich(caption,block.pie);fig.appendChild(caption);}body.appendChild(fig);
      }
    });
    document.querySelector('.story').scrollTop=0;
  }
  function loadPanorama(point) {
    state.request+=1;var current=state.request; state.yaw=0;state.pitch=0;state.fov=75;
    if(state.texture&&gl){gl.deleteTexture(state.texture);state.texture=null;}missing.hidden=false;
    document.getElementById('missing-name').textContent=point.titulo;
    if(!point.panorama||!gl)return;
    var img=new Image();img.onload=function(){if(current!==state.request)return;try{var tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);state.texture=tex;missing.hidden=true;draw();}catch(e){missing.hidden=false;}};img.onerror=function(){if(current===state.request)missing.hidden=false;};img.src=point.panorama;
  }
  function select(i){state.index=i;var item=points[i];if(!item)return;document.querySelectorAll('.point').forEach(function(button,n){button.setAttribute('aria-current',n===i?'true':'false');});renderContent(item);loadPanorama(item);location.hash='p'+String(item.numero).padStart(2,'0');}
  var list=document.getElementById('point-list');points.forEach(function(point,i){var button=document.createElement('button');button.type='button';button.className='point';button.innerHTML='<b>'+String(point.numero).padStart(2,'0')+'</b><span></span>';button.querySelector('span').textContent=point.titulo;button.onclick=function(){select(i);};list.appendChild(button);});
  canvas.addEventListener('pointerdown',function(event){state.dragging=true;state.x=event.clientX;state.y=event.clientY;canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointerup',function(){state.dragging=false;});canvas.addEventListener('pointercancel',function(){state.dragging=false;});
  canvas.addEventListener('pointermove',function(event){if(!state.dragging)return;state.yaw+=(event.clientX-state.x)*.004;state.pitch=Math.max(-1.45,Math.min(1.45,state.pitch+(event.clientY-state.y)*.004));state.x=event.clientX;state.y=event.clientY;draw();});
  canvas.addEventListener('wheel',function(event){event.preventDefault();state.fov=Math.max(35,Math.min(95,state.fov+Math.sign(event.deltaY)*4));draw();},{passive:false});window.addEventListener('resize',draw);
  var initial=Number((location.hash.match(/^#p(\d{1,2})$/)||[])[1]);select(initial>=1&&initial<=points.length?initial-1:0);
})();
