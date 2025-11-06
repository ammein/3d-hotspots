# 3D Hotspots

![Intro](./intro.gif)

# Project Architecture

```mermaid
graph TB
    %% Declaration Variables
    appM[App Management]
    modelM[Model Management]
    theatreM[TheatreJS Management]
    p(Paragraph)
    title(Title)
    hotspot(Hotspot)
    close(Close Button)
    hotspotuv(Hotspot Unit Vector)
    mode(Button Mode)
    rotateruler(Rotate Ruler)
    tbc(Tracking Button)
    load(Loading Screen)
    progress(Loading Progress)
    main[Main]
    %% Graph Start
    app[App] m1@==> load
    subgraph SScreen [Splash Scene]
    direction LR
    tbc
    p
    h[Headline]
    end
    load m2@==> SScreen
    subgraph load [Loading Scene]
    progress
    end
    SScreen m3@==> main
    subgraph main [Main Scene]
    direction TB
    subgraph msComponent [Main Components]
        direction TB
        mode
        camera[ThreeJS Camera]
        light[ThreeJS Lights]
        subgraph 3dComponent [3D Model Component]
        direction LR
        hotspot
        title
        gltf[GLTF/GLB Model]
        glsl[GLSL Postprocessing Effect]
        end
    end
    subgraph ns [Node Graph Components]
        hotspotuv
        rotateruler
    end
    end
    main m4@==> detail
    subgraph detail [Detail Scene]
    direction LR
    close
    t[Title]
    para[Paragraph]
    cta[CTA BUtton]
    end
    appHOC@{ shape: win-pane, label: "Context Provider:\\n- Locale JSON\\n- Loading Progress Number\\n- Ready State\\n- TheatreJS App Project\\n- Metadata JSON" } -.- appM
    appM -.-> SScreen
    appM -.-> load
    appM -.-> main
    appM -.-> detail
    modelHOC@{ shape: win-pane, label: "Hooks State:\\n- Mode(Wireframe/Default)\\n- HotspotID\\n- Rotation Degree\\n- Hotspot Data\\n- rotationDegree\\n- rotationSign\\nHooks Callback:\\n- type['mode' | 'hotspot' | 'rotation' | 'hotspot-data' | 'rotation-sign']" } -.- modelM
    modelM -.-> 3dComponent
    modelM -.-> msComponent
    modelM -.-> ns
    modelM -.-> detail
    theatreHOC@{ shape: win-pane, label: "Parameter:\\n<code>[SheetName] : {  [ItemObjectName] : ISheet.Object }</code>\\nStates:\\n- subscribe" } -.- theatreM
    theatreM -.-> SScreen
    theatreM -.-> main
    theatreM -.-> detail
    %% Graph Ends
    %% Main Line Animation
    classDef animate stroke-dasharray: 9\,5, stroke-dashoffset: 900, animation: dash 5s linear infinite;
    class m1,m2,m3,m4 animate
    %% Screen Node Style
    style app fill:#c85df6,color:#fff;
    classDef management fill:#ffc44e;
    class appM,modelM,theatreM,appHOC,modelHOC,theatreHOC management;
```

## Getting Started

```bash
# Clone this library
git clone https://gitlab.com/dsvideoteam/3d/3d-hotspots.git
```

### Features Uses

- GSAP (Animation)
- glsl-pipeline (WebGL)
- Lygia (GLSL Library)
- Storybook (Styling & Documentation Platform)

### Idea

The idea was to make interactive asset to work in Dassault Systemes website that uses ThreeJS library that acts as 3D Model Viewer with hotspots that guides user through information.

## Limitations

- Performance might be affected on lower spec devices. (Can be further optimized)
- Non-responsive ThreeJS camera (Make sure you setup camera distance that works across desktop & mobile ratio)
