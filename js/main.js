///////////////////////////////////////////////////////////////////////
Splitting();

gsap.registerPlugin(ScrollTrigger);
let smoothScrolling = function () {
  const lenis = new Lenis({
    //옵션
  });

  lenis.on("scroll", (e) => {
    console.log(e);
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
};
smoothScrolling();

///////////////////////////////////////////////////////////////////////




//////////////////////// preload (로딩화면) ////////////////////////
function preload() {
  let container = document.querySelector("#progress");
  let progressBar = document.querySelector(".progress-bar");
  let progressText = document.querySelector(".progress-text");
  let imgLoaded = 0;
  let imgTotal = 1000;//120  jung
  let current = 0;
  let progressTimer;
  let topValue;

  //매시간마다마다 할일
  //setInterval(할일,시간)
  //setInterval(function(){},1000)//매 1초마다마다 할일

  //setInterval를 멈추고 싶을때
  // 1) 변수에 setInterval 할당한다  let 변수 = setInterval
  // 2) clearInterval(변수)

  progressTimer = setInterval(updateProgress, 1000 / 60);

  function updateProgress() {
    imgLoaded++;
    let target = (imgLoaded / imgTotal) * 100;

    current += (target - current) * 0.01;
    //current = current + (target - current)*0.01;
    progressBar.style.width = current + "%";
    progressText.innerHTML = Math.floor(current) + "%"; // Math.floor 버림
    console.log(current);
    if (current > 99.9) {
      clearInterval(progressTimer);
      container.classList.add("progress-complete");
      progressBar.style.width = "100%";
      gsap.to(container, {
        duration: 0.5,
        yPercent: -110,
        ease: "none",
        onUpdate:function scrollPrevent(){
          showLoadingScreen();
          sp= requestAnimationFrame(scrollPrevent)//2번줄
          setTimeout(()=>{
              cancelAnimationFrame(sp);
              hideLoadingScreen();//6번줄
          }, 10);
      },
      });
    }
  }
}
preload();

//proloading시 scroll 움직이는 못하게 막기
function showLoadingScreen() {
  document.body.classList.add('loading');
  window.scrollTo(0, 0);
}
function hideLoadingScreen() {
  document.body.classList.remove('loading');
}
showLoadingScreen();

//////////////////////// end preload (로딩화면) ////////////////////////






//////////////////////// menuOpen ////////////////////////

function menuOpen() {
  let open = $(".menuOpen .open");
  let menuWrap = $(".menuWrap");
  let close = $(".menuWrap .close");
  open.click(function () {
    menuWrap.addClass("on");
  });
  close.click(function () {
    menuWrap.removeClass("on");
  });
}
menuOpen();

////////////////////////// end menuOpen ////////////////////////

//////////////////////// 백그라운드 일렁이는 화면 ////////////////////////
function back() {
  const containerEl = document.querySelector(".container");
  const canvasEl = document.querySelector("canvas#neuro");
  const devicePixelRatio = Math.min(window.devicePixelRatio, 2);

  const params = {
    rotation: 1,
    scaleMult: 1.2,
  };

  const pointer = {
    x: 0,
    y: 0,
    tX: 0,
    tY: 0,
  };

  let uniforms;
  const gl = initShader();

  setupEvents();

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  render();

  function initShader() {
    const vsSource = document.getElementById("vertShader").innerHTML;
    const fsSource = document.getElementById("fragShader").innerHTML;

    const gl =
      canvasEl.getContext("webgl") || canvasEl.getContext("experimental-webgl");

    if (!gl) {
      alert("WebGL is not supported by your browser.");
    }

    function createShader(gl, sourceCode, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, sourceCode);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(
          "An error occurred compiling the shaders: " +
          gl.getShaderInfoLog(shader)
        );
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);

    function createShaderProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(
          "Unable to initialize the shader program: " +
          gl.getProgramInfoLog(program)
        );
        return null;
      }

      return program;
    }

    const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
    uniforms = getUniforms(shaderProgram);

    function getUniforms(program) {
      let uniforms = [];
      let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        let uniformName = gl.getActiveUniform(program, i).name;
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
      }
      return uniforms;
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(shaderProgram);

    const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    return gl;
  }

  function render() {
    const currentTime = performance.now();

    pointer.x += (pointer.tX - pointer.x) * 0.5;
    pointer.y += (pointer.tY - pointer.y) * 0.5;

    gl.uniform1f(uniforms.u_time, currentTime);
    gl.uniform2f(
      uniforms.u_pointer_position,
      pointer.x / window.innerWidth,
      1 - pointer.y / window.innerHeight
    );
    gl.uniform1f(
      uniforms.u_scroll_progress,
      window["pageYOffset"] / (2 * window.innerHeight)
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  function resizeCanvas() {
    canvasEl.width = window.innerWidth * devicePixelRatio;
    canvasEl.height = window.innerHeight * devicePixelRatio;
    gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height);
    gl.viewport(0, 0, canvasEl.width, canvasEl.height);
  }

  function setupEvents() {
    window.addEventListener("pointermove", (e) => {
      updateMousePosition(e.clientX, e.clientY);
    });
    window.addEventListener("touchmove", (e) => {
      updateMousePosition(
        e.targetTouches[0].clientX,
        e.targetTouches[0].clientY
      );
    });
    window.addEventListener("click", (e) => {
      updateMousePosition(e.clientX, e.clientY);
    });

    function updateMousePosition(eX, eY) {
      pointer.tX = eX;
      pointer.tY = eY;
    }
  }
}
back();

//////////////////////// end 백그라운드 일렁이는 화면 ////////////////////////


///////////////////////// 0 섹션 /////////////////////////////////
function sec0() {
  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)


  // Scroll Down - Button
  document.addEventListener('DOMContentLoaded', function () {
    const scrollBtn = document.getElementById('scrollBtn');
    window.addEventListener('scroll', function () {
      const box = document.querySelector('.scrollBtn');
      if (window.scrollY > 0) {
        box.classList.add('move');
      } else {
        box.classList.remove('move');
      }
    });
  });


  // Preloader Text 
  window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    const firstText = document.getElementById('first-text');
    const secondText = document.getElementById('second-text');
    // Show the first text
    firstText.style.opacity = '1';
    // loading animation
    setTimeout(function () {
      firstText.style.opacity = '0';
      secondText.style.opacity = '1';
    }, 1000);
    setTimeout(function () {
      preloader.style.display = 'none';
    }, 4000);
  });


  // Loader Video 
  window.addEventListener('load', function () {
    document.body.classList.add('overflow-hidden'); // body - overflow hidden
    document.documentElement.classList.add('overflow-hidden'); // html - overflow hidden

    //비디오 실행지연 //jung
    setTimeout(function() {
      var video = document.getElementById('videoplay');
      video.play();
  }, 18500); // 2000 milliseconds = 2 seconds


    setTimeout(function () {
      const loaderVideo = document.getElementById('loaderVideo');
      loaderVideo.style.width = '90%';
      loaderVideo.style.height = '90%';
      loaderVideo.style.transform = 'translate(-50%, -50%)';
      loaderVideo.style.top = '50%';
      loaderVideo.style.left = '50%';
      loaderVideo.style.position = 'fixed';
      loaderVideo.style.borderRadius = '12px';

    }, 20000);//2000 jung
    setTimeout(() => {
      if (window.matchMedia('(max-width: 576px)').matches) {
        loaderVideo.style.width = '220px';
        loaderVideo.style.height = '220px';
        loaderVideo.style.top = '25%';
        loaderVideo.style.left = '24px';
        loaderVideo.style.right = 'auto';
        loaderVideo.style.transform = 'translate(0%, -25%)';
      } else if (window.matchMedia('(max-width: 767px)').matches) {
        loaderVideo.style.width = '220px';
        loaderVideo.style.height = '220px';
        loaderVideo.style.left = 'auto';
        loaderVideo.style.right = '40px';
        loaderVideo.style.transform = 'translate(0%, -50%)';
      } else if (window.matchMedia('(max-width: 991px)').matches) {
        loaderVideo.style.width = '310px';
        loaderVideo.style.height = '310px';
        loaderVideo.style.left = 'auto';
        loaderVideo.style.right = '40px';
        loaderVideo.style.transform = 'translate(0%, -50%)';
      } else if (window.matchMedia('(max-width: 1199px)').matches) {
        loaderVideo.style.width = '400px';
        loaderVideo.style.height = '400px';
        loaderVideo.style.left = 'auto';
        loaderVideo.style.right = '60px';
        loaderVideo.style.transform = 'translate(0%, -50%)';
      } else if (window.matchMedia('(max-width: 1399px)').matches) {
        loaderVideo.style.width = '450px';
        loaderVideo.style.height = '450px';
        loaderVideo.style.left = 'auto';
        loaderVideo.style.right = '80px';
        loaderVideo.style.transform = 'translate(0%, -50%)';
      } else {
        loaderVideo.style.width = '500px';
        loaderVideo.style.height = '500px';
        loaderVideo.style.top = '50%';
        loaderVideo.style.left = 'auto';
        loaderVideo.style.right = '100px';
        loaderVideo.style.transform = 'translate(0%, -50%)';
        loaderVideo.style.position = 'absolute';
      }
      document.body.classList.remove('overflow-hidden'); // body - overflow visible
      document.documentElement.classList.remove('overflow-hidden'); // html - overflow visible
    }, 21000); // Adjust the time as needed  //3000 jung
  });


  // ScrollMagic
  var controller = new ScrollMagic.Controller({
    loglevel: 3
  });
  new ScrollMagic.Scene({
    triggerElement: "#section2",
    triggerHook: "onEnter",
    duration: "100%"
  }).setPin("#section1 .pinWrapper", {
    pushFollowers: false
  }).addTo(controller);
  new ScrollMagic.Scene({
    triggerElement: "#section2",
    triggerHook: "onEnter",
    duration: "200%"
  }).setPin("#section2 .pinWrapper", {
    pushFollowers: false
  }).addTo(controller);
  new ScrollMagic.Scene({
    triggerElement: "#section3",
    triggerHook: "onEnter",
    duration: "200%"
  }).setPin("#section3 .pinWrapper", {
    pushFollowers: false
  }).addTo(controller);
  new ScrollMagic.Scene({
    triggerElement: "#section4",
    triggerHook: "onEnter",
    duration: "100%"
  }).setPin("#section4 .pinWrapper", {
    pushFollowers: false
  }).addTo(controller);
}
sec0()


//////////////////////// 첫번째 섹션 /////////////////////////////
function sec1() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".page1",
        start: "top top",
        end: "bottom top",
        scrub: 2,
        pin: true,
      },
    })
    .to("#page1 h1", {
      opacity: 1,
      duration: 10
    }, 5)
    .to(
      "#page1 img", {
        scale: 0.4,
        opacity: 0.3,
        duration: 10,
        webkitfilter: "brightness(" + 100 + "%)",
      },
      5
    );
}
sec1();

//////////////////////// 두번째 섹션 /////////////////////////////
function sec2() {
  let secImgs = document.querySelectorAll(".section-images")

  secImgs.forEach(function (secImg) {

    let imgs = secImg.querySelectorAll("img")
    let secImgparent = secImg.parentNode;

    imgs.forEach(function (img, index) {
      let imgDey = index * 0.8

      gsap.set(img, {
        y: 400
      })
      gsap.timeline({
          scrollTrigger: {
            trigger: secImgparent,
            start: "top 60%",
            end: "top top",
            scrub: 2,
          }
        })

        .to(img, {
          y: 0,
          duration: 2,
          delay: imgDey,
          ease: "power3.out"

        })



    })
  })


  gsap.timeline()
    .to(".section-header", {
      scrollTrigger: {
        trigger: ".section-header",
        start: "top 90%",
        end: "bottom top",
        toggleClass: "activeRightSpecific",
        scrub: true,
      },
    })

}
sec2()


function sec2_a() {

  let stickys = document.querySelectorAll("#page2"); //

  //querySelector를 쓴다면 스티키를 가지고 있는 클래스명 중에 가장 첫번째만 적용(포이치 사용 필요 없음.)

  //querySelectorAll이라서 아래의 포이치를 사용해야함 (스티키를 가지고 있는 클래스명 모두)

  stickys.forEach(function (sticky) {

    gsap.to(sticky, {
      scrollTrigger: {
        trigger: sticky,
        start: "top top",
        end: "+=200%",
        scrub: 1
      },
      y: 300,
      scale: 0.8,
      rotation: 0,
      ease: "power3.out"

    })
  })

}
sec2_a()





/////////////////////// 세번째 섹션 이미지 효과///////////////////

function sec3() {
  const swiper = new Swiper(".swiper", {
    direction: "horizontal",
    loop: false,
    speed: 800,
    slidesPerView: 4,
    spaceBetween: 60,
    mousewheel: false,
    parallax: true,
    centeredSlides: true,
    effect: "coverflow",
    coverflowEffect: {
      rotate: 40,
      slideShadows: true,
    },
    autoplay: {
      delay: 1500,
      // pauseOnMouseEnter: true,
    },
    scrollbar: {
      el: ".swiper-scrollbar",
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 60,
      },
      600: {
        slidesPerView: 2,
        spaceBetween: 60,
      },
      1000: {
        slidesPerView: 3,
        spaceBetween: 60,
      },
      1400: {
        slidesPerView: 4,
        spaceBetween: 60,
      },
      2300: {
        slidesPerView: 5,
        spaceBetween: 60,
      },
      2900: {
        slidesPerView: 6,
        spaceBetween: 60,
      },
    },
  });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#page3",
        start: "top top",
        end: "+=800",
        scrub: 2,
        pin: true,
      }
    })

}

sec3()


//////////////////////// 네번째 섹션 효과 ////////////////////////

function sec4() {
  gsap.to(".header__marq-wrapp", {
    scrollTrigger: {
      trigger: "#page4",
      start: "top bottom",
      scrub: 1.9
    },
    xPercent: -50

  })
  gsap.to(".header__marq-star", {
    scrollTrigger: {
      trigger: "#page4",
      start: "top bottom",
      scrub: 1.9
    },
    //rotation:-720
    rotate: -720

  })

}
sec4()


function about() {
  gsap.from(".about__img", {
    scrollTrigger: {
      trigger: ".about",
      start: "top bottom",
      scrub: 1.9
    },
    yPercent: 80

  })

  gsap.from(".about__img img", {
    scrollTrigger: {
      trigger: ".about",
      start: "top bottom",
      scrub: 1.9
    },
    scale: 1.6

  })

  gsap.to(".about__txt", {
    scrollTrigger: {
      trigger: ".about__wrapp",
      start: "top bottom",
      scrub: 1.9
    },
    yPercent: 50

  })

  //각영역의 제목부분의 사각도형
  let gsapSq = document.querySelectorAll(".section-title__square")
  gsapSq.forEach(function (gSq, i) {
    let rotate = gsap.from(gSq, {
      duration: 3,
      rotation: 720
    })
    ScrollTrigger.create({
      trigger: gSq,
      start: "top bottom",
      scrub: 1.9,
      animation: rotate
    })
  })



}
about();


///////////////////////// 다섯번째 섹션 //////////////////////////

function sec5() {
  // use a script tag or an external JS file
  document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(ScrollTrigger)
    // gsap code here!



    //이미지 애니
    let items = document.querySelectorAll(".anime-list li");
    items.forEach(function (el) {
      gsap.set(".hover-img", {
        xPercent: -50,
        yPercent: -50
      })
      let image = el.querySelector(".hover-img")
      let innerImage = el.querySelector(".hover-img img")
      let pos = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
      let mouse = {
        x: pos.x
      }
      let speed = 0.1;
      let xSet = gsap.quickSetter(image, "x", "px") // 

      window.addEventListener("mousemove", function (e) {
        // console.log(e.x)
        mouse.x = e.x;
      })
      gsap.ticker.add(function () { //requestAnimationFrame()
        // console.log(gsap.ticker.deltaRatio())
        let dt = 1.0 - Math.pow((1.0 - speed), gsap.ticker.deltaRatio())
        // 인터넷이 어떤 환경이라도 부드럽게 이용 가능하게 만드는 것.
        pos.x += (mouse.x - pos.x) * dt
        xSet(pos.x)
      })

      let direction = "",
        oldx = 0,
        lastCursorX = null,
        cursorThreshold = 150;

      let mousemovemethod = function (e) {
        if (e.pageX < oldx && e.clientX <= lastCursorX - cursorThreshold) {
          direction = "left"
          lastCursorX = e.clientX;
          innerImage.style.transform = "rotate(-15deg)"
        } else if (e.pageX > oldx && e.clientX >= lastCursorX + cursorThreshold) {
          direction = "right"
          lastCursorX = e.clientX;
          innerImage.style.transform = "rotate(15deg)"
        }
        oldx = e.pageX
      }

      let mouseMoveTimer; // 마우스가 멈출때를 감시하는 변수

      document.addEventListener("mousemove", function () {
        // setTimeout(할일, 시간) 시간 뒤에 함수 실행
        // setTimeout을 멈추고 싶을 떄  -> 변수에 할당
        // 변수=setTimeout(할일(함수),시간)
        // clearTimeout(변수) -> 멈추는 명령

        clearTimeout(mouseMoveTimer) // 기존 타이머를 지움
        mouseMoveTimer = setTimeout(function () {
          innerImage.style.transform = "translateX(0%) rotate(0deg)"
        }, 100)
      })

      document.addEventListener("mousemove", mousemovemethod)

    })




    // gsap.quickSetter 호출: gsap.quickSetter 메서드를 호출하여 특정 DOM 요소의 특정 CSS 속성을 신속하게 설정할 수 있는 함수를 만듭니다.

    // quickSetter(image,"x","px")image 변수의 x값을 (단위는 px) 신속하게 설정
    // xSet(100)을 호출하면 image 요소의 수평 위치가 100 픽셀로 설정됩니다

    // function ani(){
    //     console.log("애니메이션")
    //     requestAnimationFrame(ani)  //setInterval의 진화된 버전
    // }
    // ani()

    //  gsap.ticker.add()


    // 애니메이션 프레임마다 특정 요소의 속성을 업데이트하거나, 사용자 인터랙션을 실시간으로 처리하는 등의 다양한 활용이 가능합니다.


    // 🍇🍇🍇  gsap.ticker.deltaRatio()에 대해
    //GSAP (GreenSock Animation Platform)는 자바스크립트를 사용하여 웹 애니메이션을 만들기 위한 도구입니다. GSAP의 ticker는 애니메이션의 프레임 업데이트를 관리하는 메커니즘입니다. gsap.ticker.deltaRatio()는 프레임 간의 시간 변화를 비율로 반환하는 함수입니다. 이를 통해 애니메이션이 프레임 속도에 관계없이 일정하게 작동하도록 할 수 있습니다.

    // 쉽게 말해, deltaRatio()는 이전 프레임과 현재 프레임 사이의 시간 차이를 기준으로 값을 반환합니다. 이 값은 보통 1에 가까운데, 이것은 정상적인 프레임 속도(예: 60fps)에서의 값입니다. 만약 프레임 속도가 떨어지거나 증가하면, 이 값은 1보다 크거나 작아집니다. 이를 활용하여 애니메이션 속도를 프레임 속도에 맞춰 자동으로 조절할 수 있습니다.

    // 예를 들어, 애니메이션을 실행하는 동안 컴퓨터가 느려져서 프레임 속도가 떨어지면, deltaRatio()는 1보다 큰 값을 반환합니다. 이를 이용해 애니메이션의 움직임을 조정하여 일관된 시각적 효과를 유지할 수 있습니다.


    //Mouse cursor
    gsap.set(".ball", {
      xPercent: -50,
      yPercent: -50
    })
    let ball = document.querySelector(".ball");
    let pos = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }
    let mouse = {
      x: pos.x,
      y: pos.y
    }
    let speed = 0.08;

    let xSet = gsap.quickSetter(ball, "x", "px")
    let ySet = gsap.quickSetter(ball, "y", "px")

    window.addEventListener("mousemove", function (e) {

      mouse.x = e.x;
      mouse.y = e.y;
    })

    gsap.ticker.add(function () {
      let dt = 1.0 - Math.pow((1.0 - speed), gsap.ticker.deltaRatio())
      // 인터넷이 어떤 환경이라도 부드럽게 이용 가능하게 만드는 것.
      pos.x += (mouse.x - pos.x) * dt;
      pos.y += (mouse.y - pos.y) * dt;
      xSet(pos.x);
      ySet(pos.y);
    })


    // 글자 애니
    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; //26
    let interval = null;
    let list = document.querySelectorAll(".anime-list li")

    // console.log(list)
    list.forEach(function (el) {
      // el.onmouseenter=function(){} = el.addEventListener("mouseenter",function(){})   
      el.addEventListener("mouseenter", function (event) {
        let target_element = event.target.querySelector("h2")
        //이벤트를 받는 요소중에 가장 하위 요소

        let iteration = 0;

        // setInterval(할일,시간) //시간마다 할 일
        // setInterval을 멈추고 싶다면 setInterval를 변수에 할당
        // let interval=setInterval(할일,시간)
        // 멈출때 clearInterval(변수) // clearInterval(interval)

        // console.log(target_element.innerText)
        // target_element.innerText="메롱"
        // console.log(target_element.dataset.value[0])
        // .map(function(it){
        //     return          -> map 함수는 배열안에 요소를 하나씩 불러서 할일 //새로운 배열을 만든다. //item은 그 요소의 index 번호
        // })

        // console.log(Math.random())// 0 이상 1미만 사이의 부동 소수의 숫자를 뽑아줌.

        let interval = setInterval(function () {
          target_element.innerText = target_element.innerText
            .split("") //배열이 만들어짐
            .map(function (letter, index) { // 위의 배열의 각각의 item의 할 일
              if (index < iteration) {
                return target_element.dataset.value[index]
              }
              return letters[Math.floor(Math.random() * 26)] // 랜덤 
            })
            .join("") //글자화 시키는 것

          if (iteration >= target_element.dataset.value.length) {
            clearInterval(interval)
          }

          iteration += 0.3; // iteration = iteration + 0.3
        }, 20)

      })
    })
  });

}
sec5()


function sec5_t() {

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".rotatingHeader",
      start: "top 90%",
      end: "+=300 80%",
      scrub: 1,
      // pin: true,
    },
  });


  function initHeaders() {
    let header = document.querySelector(".rotatingHeader");
    let original = header.querySelector("h1");
    let clone = original.cloneNode(true);
    header.appendChild(clone);

    gsap.set(clone, {
      yPercent: -100
    });

    let originalSplit = document.querySelectorAll("h1:first-child .char");
    let cloneSplit = document.querySelectorAll("h1:last-child .char");

    gsap.set(cloneSplit, {
      rotationX: -90,
      opacity: 0,
      transformOrigin: "50% 50% -50",
    });

    tl.to(originalSplit, {
      duration: 0.4,
      rotationX: 90,
      stagger: 0.05,
      transformOrigin: "50% 50% -50"
    });
    tl.to(originalSplit, {
      duration: 0.4,
      opacity: 0,
      stagger: 0.05
    }, 0);

    tl.to(cloneSplit, {
      duration: 0.05,
      stagger: 0.05,
      opacity: 1
    }, 0.001);
    tl.to(cloneSplit, {
      duration: 0.4,
      rotationX: 0,
      stagger: 0.05
    }, 0);
  }

  initHeaders()
}
sec5_t()


///////////////////////////// 여섯번째 영역 //////////////////////////
function sec6() {

  /* slide */
  let list = document.querySelectorAll(".work ul li");
  let imgBoxs = document.querySelectorAll(".imgBox")
  let txtBoxs = document.querySelectorAll('.textBox')

  //가로스크롤
  let scrollTween = gsap.to(list, {
    xPercent: -100 * (list.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: ".work",
      start: "center center",
      scrub: 1,
      end: "+=3000",
      pin: true
    }
  })



  //배열안에 요소를 하나씩 가져와서 어떤 일을 시킨다
  imgBoxs.forEach(function (imgBox) { //item은 배열안에 각각요소를 순서대로 받는다


    gsap.timeline({
        scrollTrigger: {
          trigger: imgBox,
          start: "center right",
          end: 'center center',
          containerAnimation: scrollTween,
          scrub: true,
        }
      })
      .to(imgBox, {
        'clip-path': 'inset(0%)',
        ease: "none",
        duration: 1
      }, 0)

    //왼쪽으로 사라질때 이미지를 작게 
    gsap.timeline({
        scrollTrigger: {
          trigger: imgBox,
          start: "center center",
          end: 'center left',
          containerAnimation: scrollTween,
          scrub: true,
        }
      })
      .to(imgBox, {
        'clip-path': 'inset(30%)',
        ease: "none",
        duration: 1
      }, 0)
  })



  txtBoxs.forEach(function (txtBox) {
    gsap.timeline({
        scrollTrigger: {
          trigger: txtBox,
          start: "center 70%",
          end: 'center 40%',
          containerAnimation: scrollTween,
          scrub: true,
        }
      })
      .to(txtBox, {
        opacity: 1,
        x: -100
      }, 0)

    gsap.timeline({
        scrollTrigger: {
          trigger: txtBox,
          start: "center 30%",
          end: 'center 20%',
          containerAnimation: scrollTween,
          scrub: true,
        }
      })
      .to(txtBox, {
        opacity: 0
      }, 0)
  })

}
sec6()



///////////////////////////// 여덟번째 영역 ///////////////////////////
function canvas() {
  let canvas = document.querySelector("#page8 canvas")
  let context = canvas.getContext("2d") //canvas를 사용했다면 무조건 있어야 하는 함수
  console.log(context)

  canvas.width = window.innerWidth; // 화면의 넓이
  canvas.height = window.innerHeight; //화면의 높이

  window.addEventListener("resize", function () {
    canvas.Width = window.innerWidth; // 화면의 넓이
    canvas.height = window.innerHeight; //화면의 높이
  })

  function files(index) {
    let data = `./img/3.jpg
./img/4.jpg
./img/5.jpg
./img/6.jpg
./img/7.jpg
./img/8.jpg
./img/9.jpg
./img/10.jpg
./img/11.jpg
./img/12.jpg
./img/13.jpg
./img/14.jpg
./img/15.jpg
./img/16.jpg
./img/17.jpg
./img/18.jpg
./img/19.jpg
./img/20.jpg
./img/21.jpg
./img/22.jpg
./img/23.jpg
./img/24.jpg
./img/25.jpg
./img/26.jpg
./img/27.jpg
./img/28.jpg
./img/29.jpg
./img/30.jpg
./img/31.jpg
./img/32.jpg
./img/33.jpg
./img/34.jpg
./img/35.jpg
./img/36.jpg
./img/37.jpg
./img/38.jpg
./img/39.jpg
./img/40.jpg
./img/41.jpg
./img/42.jpg
./img/43.jpg
./img/44.jpg
./img/45.jpg
./img/46.jpg
./img/47.jpg
./img/48.jpg
./img/49.jpg
./img/50.jpg
./img/51.jpg
./img/52.jpg
./img/53.jpg
./img/54.jpg
./img/55.jpg
./img/56.jpg
./img/57.jpg
./img/58.jpg
./img/59.jpg
./img/60.jpg
./img/61.jpg
./img/62.jpg
./img/63.jpg
./img/64.jpg
./img/65.jpg
./img/66.jpg
./img/67.jpg
./img/68.jpg
./img/69.jpg
./img/70.jpg
./img/71.jpg
./img/72.jpg
./img/73.jpg
./img/74.jpg
./img/75.jpg
./img/76.jpg
./img/77.jpg
./img/78.jpg
./img/79.jpg
./img/80.jpg
./img/81.jpg
./img/82.jpg
./img/83.jpg
./img/84.jpg
./img/85.jpg
./img/86.jpg
./img/87.jpg
./img/88.jpg
./img/89.jpg
./img/90.jpg
./img/91.jpg
./img/92.jpg
./img/93.jpg
./img/94.jpg
./img/95.jpg
./img/96.jpg
./img/97.jpg
./img/98.jpg
./img/99.jpg
./img/100.jpg
./img/101.jpg
./img/102.jpg
./img/103.jpg
./img/104.jpg
./img/105.jpg
./img/106.jpg
./img/107.jpg
./img/108.jpg
./img/109.jpg
./img/110.jpg
./img/111.jpg
./img/112.jpg
./img/113.jpg
./img/114.jpg
./img/115.jpg
./img/116.jpg
./img/117.jpg
./img/118.jpg
./img/119.jpg
./img/120.jpg
./img/121.jpg
./img/122.jpg
./img/123.jpg
./img/124.jpg
./img/125.jpg
./img/126.jpg
./img/127.jpg
./img/128.jpg
./img/129.jpg
./img/130.jpg
./img/131.jpg
./img/132.jpg
./img/133.jpg
./img/134.jpg
./img/135.jpg
./img/136.jpg
./img/137.jpg
./img/138.jpg
./img/139.jpg
./img/140.jpg
./img/141.jpg
./img/142.jpg
./img/143.jpg
./img/144.jpg
./img/145.jpg`

    return data.split("\n")[index]
  }
  let frameCount = 143;
  let images = [];
  let imageSeq = {
    frame: 0
  }

  for (let i = 0; i < frameCount; i++) {
    let img = new Image(); // 이미지 태그 만들기
    img.src = files(i)
    images.push(img)
  }
  // console.log(images)
  gsap.to(imageSeq, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: 0.5,
      trigger: "#page8",
      start: "top top",
      end: "230% top",
    },
    onUpdate: render
  })
  images[0].onload = render;

  function render() {
    scaleImage(images[imageSeq.frame], context)
  }

  function scaleImage(img, ctx) {
    console.log(ctx)
    let canvas = ctx.canvas;
    let hRatio = canvas.width / img.width;
    let vRatio = canvas.height / img.height;
    let ratio = Math.max(hRatio, vRatio)
    let centerShift_x = (canvas.width - img.width * ratio) / 2
    let centerShift_y = (canvas.height - img.height * ratio) / 2

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    )
  }


  ScrollTrigger.create({
    trigger: "#page8",
    pin: true,
    start: "top top",
    end: "230% top", // 이 값을 바꾸면 위에도 바꿔야함

  })
}
canvas()



///////////////////////////// 아홉번쨰 영역 /////////////////////////////

function sec9() {
  gsap.to("[data-direct]", {
    //속성 중에 data-direct이 있는 것들 모두 다 호출 된다.
    x: (i, el) => -(el.getAttribute("data-direct")) * 400,
    //el은 data-direct 속성을 가지고 있는 요소들을 하나씩 받아옴//i 인덱스 번호
    ease: "none",
    scrollTrigger: {
      trigger: ".text_wrap",
      start: "top 60%",
      end: "top top",
      duration: 2,
      scrub: 2

    }

  })
}
sec9()


///////////////////////////// 열번째 영역 ////////////////////////////////
function sec10() {
  //slider-card

  //left
  gsap.set(".slider-left img:first-child", {
    xPercent: 50
  })
  gsap.set(".slider-left img:not(:first-child)", {
    xPercent: 100
  })

  gsap.to(".slider-left .img-1", {
    ease: "none",
    xPercent: -95,
    scale: 0.6,
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center+=" + 180 + " center",
      end: "center+=" + 900 + " center",
      scrub: 1
    }
  })

  gsap.to(".slider-left .img-2", {
    ease: "none",
    xPercent: -70,
    scale: 0.7,
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center+=" + 360 + " center",
      end: "center+=" + 900 + " center",
      scrub: 1
    }
  })
  gsap.to(".slider-left .img-3", {
    ease: "none",
    xPercent: -40,
    scale: 0.8,
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center+=" + 540 + " center",
      end: "center+=" + 900 + " center",
      scrub: 1
    }
  })

  gsap.to(".slider-left .img-4", {
    ease: "none",
    xPercent: -10,
    scale: 0.9,
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center+=" + 720 + " center",
      end: "center+=" + 900 + " center",
      scrub: 1
    }
  })

  gsap.to(".slider-left .img-5", {
    ease: "none",
    xPercent: 20,
    scale: 1,
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center+=" + 800 + " center",
      end: "center+=" + 900 + " center",
      scrub: 1
    }
  })


  //right
  gsap.set(".slider-right img:first-child", {
    xPercent: -50
  })
  gsap.set(".slider-right img:not(:first-child)", {
    xPercent: -100
  })

  gsap.to(".slider-right .img-1", {
    ease: "none",
    xPercent: 95,
    scale: 0.6,
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center+=" + 180 + " center",
      end: "center+=" + 900 + " center",
      scrub: 1
    }
  })

  gsap.to(".slider-right .img-2", {
    ease: "none",
    xPercent: 70,
    scale: 0.7,
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center+=" + 360 + " center",
      end: "center+=" + 900 + " center",
      scrub: 1
    }
  })
  gsap.to(".slider-right .img-3", {
    ease: "none",
    xPercent: 40,
    scale: 0.8,
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center+=" + 540 + " center",
      end: "center+=" + 900 + " center",
      scrub: 1
    }
  })

  gsap.to(".slider-right .img-4", {
    ease: "none",
    xPercent: 10,
    scale: 0.9,
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center+=" + 720 + " center",
      end: "center+=" + 900 + " center",
      scrub: 1
    }
  })

  gsap.to(".slider-right .img-5", {
    ease: "none",
    xPercent: -20,
    scale: 1,
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center+=" + 800 + " center",
      end: "center+=" + 900 + " center",
      scrub: 1
    }
  })





  //slider-card에 공간 만들고 pin 설정
  gsap.to(".slider-card", {
    ease: "linear",
    scrollTrigger: {
      trigger: ".slider-card",
      start: "center center",
      end: "+=1000",
      pin: false,
      pin: true,
      scrub: 1
    }
  })

}
sec10()


///////////////////////////// 열한번째 영역 //////////////////////////////

function sec11(){

  const getGrid = (selector) => {
    let elements = gsap.utils.toArray(selector),
      bounds,
      getSubset = (axis, dimension, alternating, merge) => {
        let a = [],
          subsets = {},
          onlyEven = alternating === "even",
          p;
        bounds.forEach((b, i) => {
          let position = Math.round(b[axis] + b[dimension] / 2),
            subset = subsets[position];
          subset || (subsets[position] = subset = []);
          subset.push(elements[i]);
        });
        for (p in subsets) {
          a.push(subsets[p]);
        }
        if (onlyEven || alternating === "odd") {
          a = a.filter((el, i) => !(i % 2) === onlyEven);
        }
        if (merge) {
          let a2 = [];
          a.forEach((subset) => a2.push(...subset));
          return a2;
        }
        return a;
      };
    elements.refresh = () =>
      (bounds = elements.map((el) => el.getBoundingClientRect()));
    elements.columns = (alternating, merge) =>
      getSubset("left", "width", alternating, merge);
    elements.rows = (alternating, merge) =>
      getSubset("top", "height", alternating, merge);
    elements.refresh();
  
    return elements;
  };
  
  // Function to initialize Lenis for smooth scrolling
  const initSmoothScrolling = () => {
    // Instantiate the Lenis object with specified properties
    lenis = new Lenis({
      lerp: 0.1, // Lower values create a smoother scroll effect
      smoothWheel: true // Enables smooth scrolling for mouse wheel events
    });
  
    // Update ScrollTrigger each time the user scrolls
    lenis.on("scroll", () => ScrollTrigger.update());
  
    // Define a function to run at each animation frame
    const scrollFn = (time) => {
      lenis.raf(time); // Run Lenis' requestAnimationFrame method
      requestAnimationFrame(scrollFn); // Recursively call scrollFn on each frame
    };
    // Start the animation frame loop
    requestAnimationFrame(scrollFn);
  };
  
  // Get the element with the class 'uzih3'
  const element = document.querySelector('.uzih3');
  
  // Check if the element is found ..
  if (element) {
    // Remove existing innerHTML
    element.innerHTML = '';
  
    // Add new innerHTML using the class 'uzi3'
    element.classList.add('uzi3');
    element.innerHTML = 'Fashion<br>collection';
  }
  
  
  // All elements with class .grid
  const grids = document.querySelectorAll(".grid");
  
  // Function to apply scroll-triggered animations to a given gallery
  const applyAnimation = (grid, animationType) => {
    // Child elements of grid
    const gridWrap = grid.querySelector(".grid-wrap");
    const gridItems = grid.querySelectorAll(".grid__item");
    const gridItemsInner = [...gridItems].map((item) =>
      item.querySelector(".grid__item-inner")
    );
  
    // Define GSAP timeline with ScrollTrigger
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: gridWrap,
        start: "top bottom+=5%",
        end: "bottom top-=5%",
        scrub: true
      }
    });
  
    // Apply different animations based on type
    switch (animationType) {
      case "type1":
        // Set some CSS related style values
        grid.style.setProperty("--perspective", "1000px");
        grid.style.setProperty("--grid-inner-scale", "0.5");
  
        timeline
          .set(gridWrap, {
            rotationY: 25
          })
          .set(gridItems, {
            z: () => gsap.utils.random(-1600, 200)
          })
          .fromTo(
            gridItems,
            {
              xPercent: () => gsap.utils.random(-1000, -500)
            },
            {
              xPercent: () => gsap.utils.random(500, 1000)
            },
            0
          )
          .fromTo(
            gridItemsInner,
            {
              scale: 2
            },
            {
              scale: 0.5
            },
            0
          );
  
        break;
  
      case "type2":
        // Set some CSS related style values
        grid.style.setProperty("--grid-width", "160%");
        grid.style.setProperty("--perspective", "2000px");
        grid.style.setProperty("--grid-inner-scale", "0.5");
        grid.style.setProperty("--grid-item-ratio", "0.8");
        grid.style.setProperty("--grid-columns", "6");
        grid.style.setProperty("--grid-gap", "14vw");
  
        timeline
          .set(gridWrap, {
            rotationX: 20
          })
          .set(gridItems, {
            z: () => gsap.utils.random(-3000, -1000)
          })
          .fromTo(
            gridItems,
            {
              yPercent: () => gsap.utils.random(100, 1000),
              rotationY: -45,
              filter: "brightness(200%)"
            },
            {
              ease: "power2",
              yPercent: () => gsap.utils.random(-1000, -100),
              rotationY: 45,
              filter: "brightness(0%)"
            },
            0
          )
          .fromTo(
            gridWrap,
            {
              rotationZ: -5
            },
            {
              rotationX: -20,
              rotationZ: 10,
              scale: 1.2
            },
            0
          )
          .fromTo(
            gridItemsInner,
            {
              scale: 2
            },
            {
              scale: 0.5
            },
            0
          );
  
        break;
  
      case "type3":
        // Set some CSS related style values
        grid.style.setProperty("--grid-width", "105%");
        grid.style.setProperty("--grid-columns", "8");
        grid.style.setProperty("--perspective", "1500px");
        grid.style.setProperty("--grid-inner-scale", "0.5");
  
        timeline
          .set(gridItems, {
            transformOrigin: "50% 0%",
            z: () => gsap.utils.random(-5000, -2000),
            rotationX: () => gsap.utils.random(-65, -25),
            filter: "brightness(0%)"
          })
          .to(
            gridItems,
            {
              xPercent: () => gsap.utils.random(-150, 150),
              yPercent: () => gsap.utils.random(-300, 300),
              rotationX: 0,
              filter: "brightness(200%)"
            },
            0
          )
          .to(
            gridWrap,
            {
              z: 6500
            },
            0
          )
          .fromTo(
            gridItemsInner,
            {
              scale: 2
            },
            {
              scale: 0.5
            },
            0
          );
  
        break;
  
      case "type4":
        // Set some CSS related style values
        grid.style.setProperty("--grid-width", "50%");
        grid.style.setProperty("--perspective", "3000px");
        grid.style.setProperty("--grid-item-ratio", "0.8");
        grid.style.setProperty("--grid-columns", "3");
        grid.style.setProperty("--grid-gap", "1vw");
  
        timeline
          .set(gridWrap, {
            transformOrigin: "0% 50%",
            rotationY: 30,
            xPercent: -75
          })
          .set(gridItems, {
            transformOrigin: "50% 0%"
          })
          .to(
            gridItems,
            {
              duration: 0.5,
              ease: "power2",
              z: 500,
              stagger: 0.04
            },
            0
          )
          .to(
            gridItems,
            {
              duration: 0.5,
              ease: "power2.in",
              z: 0,
              stagger: 0.04
            },
            0.5
          )
          .fromTo(
            gridItems,
            {
              rotationX: -70,
              filter: "brightness(120%)"
            },
            {
              duration: 1,
              rotationX: 70,
              filter: "brightness(0%)",
              stagger: 0.04
            },
            0
          );
  
        break;
  
      case "type5":
        // Set some CSS related style values
        grid.style.setProperty("--grid-width", "120%");
        grid.style.setProperty("--grid-columns", "8");
        grid.style.setProperty("--grid-gap", "0");
  
        const gridObj = getGrid(gridItems);
  
        timeline
          .set(gridWrap, {
            rotationX: 50
          })
          .to(gridWrap, {
            rotationX: 30
          })
          .fromTo(
            gridItems,
            {
              filter: "brightness(0%)"
            },
            {
              filter: "brightness(100%)"
            },
            0
          )
          .to(
            gridObj.rows("even"),
            {
              xPercent: -100,
              ease: "power1"
            },
            0
          )
          .to(
            gridObj.rows("odd"),
            {
              xPercent: 100,
              ease: "power1"
            },
            0
          )
          .addLabel("rowsEnd", ">-=0.15")
          .to(
            gridItems,
            {
              ease: "power1",
              yPercent: () => gsap.utils.random(-100, 200)
            },
            "rowsEnd"
          );
        break;
  
      case "type6":
        // Set some CSS related style values
        grid.style.setProperty("--perspective", "2500px");
        grid.style.setProperty("--grid-width", "100%");
        grid.style.setProperty("--grid-gap", "6");
        grid.style.setProperty("--grid-columns", "3");
        grid.style.setProperty("--grid-item-ratio", "1");
  
        timeline.fromTo(
          gridItems,
          {
            transformOrigin: "50% 200%",
            rotationX: 0,
            yPercent: 400
          },
          {
            yPercent: 0,
            rotationY: 360,
            opacity: 0.2,
            scale: 0.8,
            stagger: 0.03
          }
        );
  
        break;
  
      default:
        console.error("Unknown animation type.");
        break;
    }
  };
  
  // Apply animations to each grid---
  
  // you can tweek to use the switch case you want😂😂
  
  const scroll = () => {
    grids.forEach((grid, i) => {
      // Determine animation type
      let animationType;
      switch (i % 2) {
        case 0:
          animationType = "type3";
          break;
        case 1:
          animationType = "type5";
          break;
        // case 2:
        // 	animationType = 'type3';
        // 	break;
        // case 3:
        // 	animationType = 'type4';
        // 	break;
        // case 4:
        // 	animationType = 'type5';
        // 	break;
        // case 5:
        // 	animationType = 'type6';
        // 	break;
      }
      applyAnimation(grid, animationType);
    });
  };
  
  initSmoothScrolling();
  scroll();
  document.body.classList.remove("loading");
}
sec11()





////////////////////////////// 풋터 전 마무리 영역 ////////////////////////////

function fot() {

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".page12",
        start: "top top",
        end: "bottom top",
        scrub: 2,
        pin: true,
      },
    })
    .to("#page12 .breathe-animation ", {
      opacity: 1,
      duration: 10
    }, 5)
    .to(
      "#page12 img", {
        scale: 3,
        opacity: 0,
        duration: 10,
        webkitfilter: "brightness(" + 100 + "%)",
      },
      5
    );
}
fot()


/////////////////////////////// 풋터 시작 ///////////////////////////////////
function fot_1(){
  function serv(){
    gsap.from(".serv__item-arrow", {
        scrollTrigger: {
            trigger: ".serv__list",
            start: "top bottom",
            scrub: 1.9
        },
        // ★  y:(index번호,item를 하나씩 가져오는 변수)=>() ★
        x: (i, el) => (1 - el.getAttribute("data-speed")) 

    })
}
serv()
}
fot_1()