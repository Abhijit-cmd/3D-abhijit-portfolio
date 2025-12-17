# 🚀 My Portfolio Website

Welcome to the repository for my personal portfolio website! This is where I showcase my skills, projects, and a bit of my personality through jaw-dropping 3D animations, slick interactions, and fluid motion. If you're into creative web design, you're in the right place.

**Live Site:** [View Portfolio](https://3-d-abhijit-portfolio-zwag.vercel.app)

![Portfolio Preview](public/assets/nav-link-previews/landing.png)

## 🔥 Features

- **3D Animations**: Custom-made interactive keyboard using Spline with skills as keycaps that reveal titles and descriptions on hover.
- **Slick Interactions**: Powered by GSAP and Framer Motion for smooth animations on scroll, hover, and element reveal.
- **Space Theme**: Particles on a dark background to simulate a cosmic environment, making the experience out of this world.
- **COPEZONE**: A video gallery section for gaming clips with categories (Gameplay, Funny Moments), custom thumbnails, and PostgreSQL database.
- **Responsive Design**: Fully responsive across all devices to ensure the best user experience.
- **Innovative Web Design**: Combining creativity with functionality to push the boundaries of modern web design.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Shadcn UI, Aceternity UI
- **Database**: PostgreSQL with Prisma ORM
- **Animations**: GSAP, Framer Motion, Spline Runtime
- **Misc**: Resend, Socket.io, Zod
- **Frontend**: Next.js, React, Tailwind CSS, Shadcn, Aceternity UI
- **Animations**: GSAP, Framer Motion, Spline Runtime
- **Misc**: Resend, Socketio, Zod


## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:

    ```bash
     gh repo clone Abhijit-cmd/3D-abhijit-portfolio
    ```

2. Navigate to the project directory:

    ```bash
    cd Portfolio
    ```

3. Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```
4. Set up environment variables:

    Create a `.env` file in the root directory and add:

    ```env
    DATABASE_URL="your_postgresql_connection_string"
    BLOB_READ_WRITE_TOKEN="your_vercel_blob_token" # Only needed for production
    ```

5. Set up the database:

    ```bash
    npx prisma generate
    npx prisma migrate deploy
    ```

6. Run the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the magic!


## 🚀 Deployment

This site is deployed on Vercel with Neon PostgreSQL and Vercel Blob storage.

### Deployment Steps:

1. **Set up Neon Database**
   - Create a PostgreSQL database at [neon.tech](https://neon.tech)
   - Copy the connection string

2. **Set up Vercel Blob Storage**
   - In Vercel Dashboard → Storage → Create Blob Store
   - Copy the `BLOB_READ_WRITE_TOKEN`

3. **Deploy to Vercel**
   - Push your code to GitHub
   - Connect repository to Vercel
   - Add environment variables in Vercel:
     - `DATABASE_URL`: Your Neon connection string
     - `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token
     - `RESEND_API_KEY`: (Optional) For contact form

4. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

### Storage Configuration

- **Development**: Videos stored locally in `/public/uploads/`
- **Production**: Videos stored in Vercel Blob (100MB max per file)
- The system automatically switches between local and cloud storage based on environment

## 🤝 Contributing

If you'd like to contribute or suggest improvements, feel free to open an issue or submit a pull request. All contributions are welcome!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
