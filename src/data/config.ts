const config = {
  title: "Abhijit Deb | Full-Stack Developer",
  description: {
    long: "Explore the portfolio of Abhijit, a full-stack developer and creative technologist specializing in interactive web experiences. Let's build something amazing together!",
    short:
      "Discover the portfolio of Abhijit, a full-stack developer creating interactive web experiences and innovative projects.",
  },
  keywords: [
    "Abhijit",
    "portfolio",
    "full-stack developer",
    "creative technologist",
    "web development",
    "AI/ML",
    "3D animations",
    "interactive websites",
    "web design",
    "GSAP",
    "React",
    "Next.js",
    "Spline",
    "Framer Motion",
  ],
  author: "Abhijit Deb",
  email: "Abhijitdeb063@gmail.com",
  site: "https://nareshkhatri.site",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    discord:"https://discord.com/users/1439114943260786699",
    linkedin: "https://www.linkedin.com/in/abhi-deb/",
    instagram: "https://www.instagram.com/aapbhijit/?igsh=YzVsNW0wcnhuY2h2#",
    facebook: "https://www.facebook.com/HotChaddi/",
    github: "https://github.com/Abhijit-cmd",
  },
};
export { config };
