/*
 * ALL the text on the site lives here. Edit this file and nothing else
 * to change the portfolio. Content is taken from the résumé.
 */
export const profile = {
  name: "Abhishek Nayal",
  role: "Full Stack Developer · Software Engineer Intern",
  greeting: "Hello, I'm",
  tagline:
    "I build scalable, multi-tenant web platforms with Python, Ruby on Rails, Spring Boot and React, and I work with AI agents and Claude skills to ship faster.",
  location: "India",
  email: "abhishek21nayal@gmail.com",
  resume: "assets/resume.pdf",
  about: [
    "I'm a Full Stack Developer with experience in Python, FastAPI, React and REST APIs, contributing to scalable applications and multi-tenant systems.",
    "At Code Garage Tech I work on Connvo, a production-grade customer support and automation platform, and built Unwind, a platform that visualises complex codebases as interactive dependency graphs.",
    "I also work on AI-assisted development with Claude and Cursor: AI agents, structured prompting, AI-assisted testing and debugging, and Claude skills that define coding guidelines and reusable workflows.",
  ],
  facts: [
    ["Currently", "Engineer Intern, Code Garage Tech"],
    ["Education", "B.Tech CS, 2026"],
    ["Focus", "Full stack, backend, AI agents"],
  ],
  stats: [
    { value: 5, suffix: "", label: "Languages" },
    { value: 5, suffix: "", label: "Projects" },
    { value: 2, suffix: "", label: "Production platforms" },
    { value: 50, suffix: "%", label: "Complexity cut (Unwind)" },
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/iAmAbhi27" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/abhishek-nayal-977b6724b/" },
    { label: "Email", href: "mailto:abhishek21nayal@gmail.com" },
  ],
};

/* colours: [from, to, accent] used for the generated cover art */
export const projects = [
  {
    title: "Connvo",
    kind: "Customer support platform",
    year: "Apr 2026 – Present",
    summary: "Multi-tenant omnichannel support and automation platform with IVR and live call queues.",
    description:
      "A production-grade, multi-tenant customer support and automation platform built at Code Garage Tech. It supports workflows across multiple client organisations, with IVR, live call queues, dashboards and third-party integrations.",
    highlights: [
      "Features for a scalable multi-tenant platform on Ruby on Rails and PostgreSQL",
      "IVR systems, live call queues and real-time dashboards using WebSockets with Action Cable",
      "Background job processing with Sidekiq for reliable asynchronous workflows",
    ],
    tech: ["Ruby on Rails", "PostgreSQL", "Action Cable", "WebSockets", "Sidekiq"],
    colors: ["#e7b8a8", "#f3dcc7", "#c9785d"],
    links: {},
  },
  {
    title: "Unwind",
    kind: "Workflow visualisation",
    year: "2026",
    summary: "Interactive dependency graphs that make complex codebases easy to understand.",
    description:
      "A Python and FastAPI platform that visualises complex codebases as interactive dependency graphs, built with AI-assisted workflows using Claude Skills files.",
    highlights: [
      "Visual dependency mapping reduced codebase complexity by 50%",
      "Claude Skills files for code analysis and development automation",
      "CloudWatch telemetry and structured logs for monitoring performance",
    ],
    tech: ["Python", "FastAPI", "Claude Skills", "AWS CloudWatch"],
    colors: ["#b9cdb4", "#e3ecd9", "#5f7a5e"],
    links: {},
  },
  {
    title: "JeevanCare",
    kind: "Telemedicine web app",
    year: "Project",
    summary: "Full-stack telemedicine with real-time video consultations and an AI symptom chatbot.",
    description:
      "A full-stack telemedicine platform built with React, Firebase and Spring Boot that enables real-time video consultations over WebRTC.",
    highlights: [
      "Real-time video consultations via WebRTC",
      "AI chatbot for automated symptom checking and REST-based health recommendations",
      "JWT authentication and authorisation protecting sensitive healthcare data",
    ],
    tech: ["React", "Firebase", "Spring Boot", "WebRTC", "JWT"],
    colors: ["#c3d3d6", "#e6eef0", "#5f8089"],
    links: { code: "https://github.com/iAmAbhi27/jeevan-care/tree/main" },
  },
  {
    title: "CI/CD Automation Platform",
    kind: "Backend platform",
    year: "Project",
    summary: "Backend for automating build, test and deployment workflows.",
    description:
      "The backend of a CI/CD platform that automates build, test and deployment workflows, with secure access control and APIs for managing projects and pipelines.",
    highlights: [
      "Secure authentication and role-based authorisation with JWT and Spring Security",
      "RESTful APIs in Spring Boot for projects, pipelines and execution history",
    ],
    tech: ["Java", "Spring Boot", "Spring Security", "JWT", "REST APIs"],
    colors: ["#dcb9c4", "#f2dfe5", "#a65f75"],
    links: { code: "https://github.com/iAmAbhi27/CI-CD-Platform" },
  },
  {
    title: "DSA Practice",
    kind: "Problem solving",
    year: "2022 – 2026",
    summary: "Data structures and algorithms solutions from LeetCode and regular practice.",
    description:
      "A repository of data structures and algorithms solutions, built up through LeetCode and regular problem-solving practice alongside my degree.",
    highlights: ["LeetCode and regular practice problems", "Core data structures and algorithms"],
    tech: ["Java", "Python", "DSA"],
    colors: ["#ecd49a", "#f7ecd0", "#b58a3a"],
    links: { code: "https://github.com/iAmAbhi27/Data-Structures-and-Algorithms" },
  },
];

export const skills = [
  { group: "Languages", items: ["Java", "JavaScript", "Python", "C", "Ruby"] },
  {
    group: "Backend & Databases",
    items: ["Spring Boot", "Spring Security", "REST APIs", "FastAPI", "Hibernate", "PostgreSQL", "MySQL"],
  },
  { group: "Frontend", items: ["React", "Redux", "HTML5", "CSS3", "Bootstrap", "Tailwind CSS"] },
  { group: "Tools & DevOps", items: ["Git", "GitHub", "Docker", "CI/CD", "Nginx", "Postman"] },
  { group: "Security & Testing", items: ["JWT", "JUnit", "API Testing"] },
  { group: "AI development", items: ["Claude", "Cursor", "AI agents", "Claude Skills", "Structured prompting"] },
];

export const achievements = [
  {
    year: "2026",
    title: "Production multi-tenant platform",
    place: "Connvo · Code Garage Tech",
    text: "Contributing to a production-grade support platform with IVR, live call queues, dashboards and integrations.",
  },
  {
    year: "2026",
    title: "50% less codebase complexity",
    place: "Unwind",
    text: "Built interactive dependency graphs that cut the complexity of understanding large codebases by half.",
  },
  {
    year: "2026",
    title: "AI-assisted development",
    place: "Claude, Cursor & skills",
    text: "Used AI agents, structured prompting and Claude skills to improve code generation, testing and debugging.",
  },
  {
    year: "Project",
    title: "Telemedicine with WebRTC",
    place: "JeevanCare",
    text: "Shipped real-time video consultations with JWT-secured access and an AI symptom-checking chatbot.",
  },
  {
    year: "Project",
    title: "CI/CD backend",
    place: "CI/CD Automation Platform",
    text: "Designed secure REST APIs and role-based access for pipelines and execution history.",
  },
  {
    year: "2026",
    title: "B.Tech in Computer Science",
    place: "CGPA 7.9 / 10",
    text: "Completed with coursework in Operating Systems and consistent DSA practice on LeetCode.",
  },
];

export const journey = [
  {
    when: "April 2026 – Present",
    title: "Software Engineer Intern",
    where: "Code Garage Tech Pvt. Ltd.",
    text: "Building Connvo, a multi-tenant support and automation platform (Rails, PostgreSQL, Action Cable, Sidekiq), and Unwind, a FastAPI platform for visualising codebases. Using Claude skills files to improve development workflows, and improving UI components for usability and responsiveness.",
  },
  {
    when: "Sept 2022 – July 2026",
    title: "B.Tech in Computer Science",
    where: "Uttarakhand Technical University (VMSBUTU)",
    text: "CGPA 7.9/10. Coursework in Operating Systems and Data Structures & Algorithms (LeetCode and regular problems).",
  },
];
