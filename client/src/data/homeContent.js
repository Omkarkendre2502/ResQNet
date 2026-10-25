/**
 * Content data for the ResQNet public Home page.
 * All texts, labels, hotlines, photos, safety guidelines, and FAQs are centralized here.
 */

export const hotlines = [
  {
    number: '112',
    name: 'National Emergency',
    subtext: 'Police, Disaster & Universal Hotline',
    tel: 'tel:112',
    badge: '24/7 Priority',
    color: 'danger',
    icon: 'ShieldAlert'
  },
  {
    number: '101',
    name: 'Pune Fire Brigade',
    subtext: 'Fire, Rescue & Structural Hazards',
    tel: 'tel:101',
    badge: 'Fire & Rescue',
    color: 'warning',
    icon: 'Flame'
  },
  {
    number: '108',
    name: 'Emergency Medical',
    subtext: 'Ambulance & Paramedic Dispatch',
    tel: 'tel:108',
    badge: 'Medical EMS',
    color: 'info',
    icon: 'Ambulance'
  }
];

export const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Safety Tips', href: '#safety-tips' },
  { label: 'Incident Map', href: '#map-preview' },
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' }
];

export const heroSlides = [
  {
    id: 1,
    headline: 'Fast emergency reporting for Pune',
    subheading:
      'Connecting Pune citizens directly with municipal control authorities and specialized field squads for rapid dispatch and coordinated response.',
    imageJpg: '/images/hero-1.jpg',
    imageWebp: '/images/hero-1.webp',
    alt: 'Pune firefighters actively tackling an urban structural fire',
    tag: 'Disaster Management & Fire Response'
  },
  {
    id: 2,
    headline: 'Rapid ambulance & paramedic dispatch',
    subheading:
      'Triage critical medical trauma, road collisions, and urgent health crises with real-time tracking across all Pune municipal wards.',
    imageJpg: '/images/hero-2.jpg',
    imageWebp: '/images/hero-2.webp',
    alt: 'Emergency response ambulance with active flashing lights',
    tag: '108 Emergency Medical Services'
  },
  {
    id: 3,
    headline: 'Monsoon flood & disaster preparedness',
    subheading:
      'Coordinating rapid water rescue, flood evacuation, and riverbank containment throughout the Pune metropolitan region.',
    imageJpg: '/images/hero-3.jpg',
    imageWebp: '/images/hero-3.webp',
    alt: 'Disaster response team conducting flood relief operations',
    tag: 'Pune Municipal Area Flood Squad'
  }
];

export const services = [
  {
    id: 'fire',
    title: 'Fire Emergency',
    category: 'Fire',
    imageJpg: '/images/service-fire.jpg',
    imageWebp: '/images/service-fire.webp',
    alt: 'Firefighters with pressurized hose combating flames',
    summary: 'Commercial, residential, and industrial fire outbreaks dispatched to Pune Fire Brigade stations.',
    badge: 'Immediate Priority'
  },
  {
    id: 'flood',
    title: 'Flood & Deluge Relief',
    category: 'Flood',
    imageJpg: '/images/service-flood.jpg',
    imageWebp: '/images/service-flood.webp',
    alt: 'Emergency rescue boat during monsoon urban flooding',
    summary: 'River overflow, low-lying waterlogging, and rapid citizen evacuation during monsoon floods.',
    badge: 'Disaster Squad'
  },
  {
    id: 'accident',
    title: 'Road Traffic Accident',
    category: 'Accident',
    imageJpg: '/images/service-accident.jpg',
    imageWebp: '/images/service-accident.webp',
    alt: 'Emergency response vehicle securing highway collision scene',
    summary: 'High-speed collisions, vehicle extrication, and highway emergencies across major Pune corridors.',
    badge: 'Rapid Medical'
  },
  {
    id: 'collapse',
    title: 'Building & Structural Collapse',
    category: 'Building Collapse',
    imageJpg: '/images/service-collapse.jpg',
    imageWebp: '/images/service-collapse.webp',
    alt: 'Search and rescue squad assessing structural collapse site',
    summary: 'Specialized rubble search, structural assessment, and technical citizen extraction.',
    badge: 'Search & Rescue'
  },
  {
    id: 'medical',
    title: 'Emergency Medical Care',
    category: 'Medical',
    imageJpg: '/images/service-medical.jpg',
    imageWebp: '/images/service-medical.webp',
    alt: '108 Paramedic squad preparing urgent patient transport',
    summary: 'Critical cardiac events, respiratory failure, and trauma transit via 108 Advanced Life Support.',
    badge: '24/7 Paramedic'
  }
];

export const workflowSteps = [
  {
    step: '01',
    title: 'Citizen Reports',
    description: 'Submit incident category, precise Pune landmark, and severity in under 30 seconds.',
    icon: 'Siren'
  },
  {
    step: '02',
    title: 'Verified by Control Room',
    description: 'Pune Municipal Disaster Control Room validates information and assigns priority triage.',
    icon: 'ShieldCheck'
  },
  {
    step: '03',
    title: 'Rescue Team Assigned',
    description: 'The nearest standby emergency squad is dispatched with GPS navigation and incident briefing.',
    icon: 'Ambulance'
  },
  {
    step: '04',
    title: 'Track Until Completed',
    description: 'Follow milestone updates from departure to arrival and final mission resolution in real time.',
    icon: 'CheckCircle2'
  }
];

export const safetyCategories = [
  {
    id: 'fire',
    label: 'Fire Safety',
    tips: [
      {
        title: 'Stay low beneath smoke',
        body: 'Smoke and toxic gases rise towards the ceiling. Stay low on hands and knees where breathable air remains coolest.'
      },
      {
        title: 'Never use elevators in a fire',
        body: 'Power failure may leave you trapped inside elevator shafts. Always use marked fire emergency stairwells.'
      },
      {
        title: 'Check door handles before opening',
        body: 'Feel door surfaces with the back of your hand. If hot, fire is on the other side; find an alternate escape window or route.'
      },
      {
        title: 'Stop, drop, and roll',
        body: 'If your clothing catches fire, do not run. Stop moving immediately, drop flat to the ground, and roll repeatedly to extinguish flames.'
      },
      {
        title: 'Alert others and dial 101 / 112',
        body: 'Evacuate immediately without gathering personal items. Call Pune Fire Brigade as soon as you are safely outside.'
      }
    ]
  },
  {
    id: 'flood',
    label: 'Flood & Deluge',
    tips: [
      {
        title: 'Turn around, don’t drown',
        body: 'Never attempt to drive or walk through moving water. Just 6 inches of moving water can sweep an adult off their feet.'
      },
      {
        title: 'Disconnect utilities beforehand',
        body: 'Switch off the main electrical breaker and shut off gas cylinders before water enters living spaces.'
      },
      {
        title: 'Move to higher elevation',
        body: 'Residents in low-lying riverside colonies (Mutha/Mula basins) should evacuate early to designated municipal shelters.'
      },
      {
        title: 'Avoid submerged drains and power lines',
        body: 'Stay clear of missing manhole covers, storm drainage grates, and submerged electrical cables.'
      },
      {
        title: 'Keep emergency supplies prepared',
        body: 'Pack bottled drinking water, non-perishable food, flashlights, prescription medication, and identification in a waterproof bag.'
      }
    ]
  },
  {
    id: 'accident',
    label: 'Road Collision',
    tips: [
      {
        title: 'Secure the scene safely',
        body: 'Park your vehicle safely off the carriageway, engage emergency hazard lights, and set reflective hazard triangles.'
      },
      {
        title: 'Do not move injured casualties recklessly',
        body: 'Unless there is immediate danger of fire or vehicle rollover, avoid moving injured victims to prevent spinal cord damage.'
      },
      {
        title: 'Call 112 or 108 immediately',
        body: 'Clearly state your location, highway mile marker or nearest junction, number of vehicles, and approximate casualty count.'
      },
      {
        title: 'Control heavy bleeding with pressure',
        body: 'Use clean cloth or first aid bandages to apply firm, direct pressure to severe external wounds.'
      },
      {
        title: 'Keep rescue corridors clear',
        body: 'Do not crowd around casualties. Guide arriving police, fire tenders, and ambulances directly to the vehicles.'
      }
    ]
  },
  {
    id: 'collapse',
    label: 'Earthquake & Collapse',
    tips: [
      {
        title: 'Drop, Cover, and Hold On',
        body: 'Drop down onto your hands and knees, take cover beneath a heavy desk or table, and hold on until violent shaking stops.'
      },
      {
        title: 'Stay away from glass and exterior walls',
        body: 'Avoid windows, tall bookcases, heavy light fixtures, and unanchored furniture that could topple.'
      },
      {
        title: 'If trapped under rubble, protect your airway',
        body: 'Cover your nose and mouth with clothing to avoid breathing dense concrete dust. Tap rhythmically on pipes or metal walls.'
      },
      {
        title: 'Avoid open flames and light matches',
        body: 'Leaking domestic gas lines are common following structural failure. Use battery flashlights only.'
      },
      {
        title: 'Evacuate calmly once shaking ends',
        body: 'Check for structural cracks, avoid exterior balconies, and proceed down stairwells into open courtyards.'
      }
    ]
  }
];

export const aboutHighlights = [
  {
    title: 'Single Unified Platform',
    desc: 'Seamlessly bridges Pune citizens, municipal control room dispatchers, and specialized field rescue teams on one coordinate-aware system.'
  },
  {
    title: 'Real-Time Mission Progression',
    desc: 'Transparent live updates from initial triage to squad dispatch, on-scene arrival, and completed resolution.'
  },
  {
    title: 'Geospatial Incident Intelligence',
    desc: 'Interactive mapping across Pune key sectors including Shivajinagar, Hinjawadi, Swargate, Hadapsar, and Kothrud.'
  },
  {
    title: 'Audit Logs & Readiness Metrics',
    desc: 'Strict accountability records, response time tracking, and post-incident analytics for civic disaster preparedness.'
  }
];

export const faqs = [
  {
    id: 1,
    question: 'Who can report an emergency on ResQNet?',
    answer:
      'Any citizen, resident, or commuter within the Pune municipal boundary can report an emergency through the ResQNet portal. You simply need a free citizen account to file reports.'
  },
  {
    id: 2,
    question: 'Is login required to report an incident or view the map?',
    answer:
      'Yes. To ensure data authenticity, eliminate spam dispatches, and protect field personnel, users must be logged in to file an emergency or access spatial incident maps. Hotlines 112, 101, and 108 are always freely accessible to everyone without an account.'
  },
  {
    id: 3,
    question: 'What information should I provide when filing a report?',
    answer:
      'Select the emergency type (Fire, Flood, Accident, Building Collapse, or Other), provide an accurate Pune landmark or street address, select severity level, and write a brief description. You may also attach a live photograph of the scene.'
  },
  {
    id: 4,
    question: 'How quickly will rescue teams respond after submitting?',
    answer:
      'Emergency reports are reviewed by control room dispatchers within minutes. Urban emergency units target response arrival within 10 minutes, depending on traffic conditions and proximity to your sector.'
  },
  {
    id: 5,
    question: 'What if it is an immediate, life-threatening crisis?',
    answer:
      'Always dial Pune Emergency Hotlines immediately: 112 for Police/Disaster, 101 for Fire Brigade, or 108 for Medical Ambulance. ResQNet is designed to coordinate operations and support field dispatch, but verbal calls should always come first in critical life-safety moments.'
  },
  {
    id: 6,
    question: 'How can I track the status of my reported incident?',
    answer:
      'Log into your Citizen Dashboard to view live status badges (Reported → Assigned → On the Way → Reached → Completed) along with assigned team callsigns and dispatch timeline notes.'
  }
];
