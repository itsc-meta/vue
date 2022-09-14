<template>
  <div class="loading-surface">
    <h1>
      META ITSC
    </h1>
    <p>
      <slot></slot>
    </p>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="100vw"
      viewBox="0,0, 800,400"
    >
      <!-- SmallTrack -->
      <defs>
        <path
          id="track"
          stroke="black"
          stroke-width="1"
          fill="none"
          d="M 200,200 L 300,200 A 50,50 0 1 1 250,250
      L 250,150 A 50,50 0 1 0 200,200"
        ></path>
      </defs>
      <!-- BigTrack -->
      <g transform=" rotate(-45), translate(-600, -200), scale(3)">
        <path
          id="bigTrack"
          stroke="#00785e"
          stroke-width="16"
          fill="none"
          d="M 200,200 L 241,200 M 259 200 L 300,200 A 50,50 0 1 1 250,250
        L 250,150 A 50,50 0 1 0 200,200"
        ></path>
        <!-- Mask -->
        <mask id="Mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white"></rect>
          <path
            id="overUnder"
            fill="black"
            d="M 240,192 L 240,208 L 260,208 L 260,192 Z"
          >
            <animate
              dur="10s"
              attributeName="fill"
              calcMode="discrete"
              repeatCount="indefinite"
              values="black; white"
              keyTimes="0; 0.3"
            ></animate>
          </path>
        </mask>
        <!-- Car -->
        <g mask="url(#Mask)">
          <g
            id="car"
            stroke="black"
            stroke-width=" 0.5"
            transform="scale(0.2), rotate(90 30 0)"
          >
            <path
              fill="DODGERBLUE"
              d="M 20 10 L 40 10 
    C40,10 50,10 50,20 
    L 50 80
    C 50,80 50,90 40,90
    L20,90
    C 20,90 10,90 10,80
    L10,20
    C 10,20 10,10 20,10
    "
            ></path>
            <path d="M 10 30 L 5,36 M 50,30 L55, 36"></path>
            <path
              fill="LEMONCHIFFON"
              d="M 10,20 C 10,20 20,20 20,10 M 10,20 C 10,20 10,10 20,10
    M 40,10 C 40,10 40,20 50,20 M 40,10 C40,10 50,10 50,20 "
            ></path>
            <path
              fill="ORANGERED"
              d="M 20,90 L 20 87 C 20,87 15,87 10,80 M 20,90 C 20,90 10,90 10,80
    M 40,90 L40,87 C 40,87 45,87 50,80  C 50,80 50,90 40,90"
            ></path>
            <path
              fill="white"
              opacity="0.7"
              d="M 15,75 L 15,30 C 15,30 30,25 45,30
    L 45,75 C 45,75 30,85 15,75"
            ></path>
            <path
              fill="DODGERBLUE"
              d="M 20,45 L 20,70
    C 20,70 30,80 40,70 L 40,45
    C 40,45 30,40 20,45"
            ></path>
            <path
              fill="black"
              d="M 15,75 L 20,70
    M 45,75 L 40,70
    M 15,30 L 20,45
    M 45,30 L 40,45
    M 15,60 L20,60
    M 45,60 L 40,60"
            ></path>
            <animateMotion dur="10s" rotate="auto" repeatCount="indefinite">
              <mpath xlink:href="#track"></mpath>
            </animateMotion>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>
<style lang="scss">
.loading-surface {
  width: 100vw;
  height: 100vh;
  background-color: #FFF;
  h1 {
    text-align: center;
    color: #00785e;
  }
  p {
    text-align: center;
  }
}
</style>