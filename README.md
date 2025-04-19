# FetchAFriend
**FetchAFriend** is a dog adoption web app built using React and the Fetch Frontend Take-Home API. It allows users to search, filter, and adopt dogs from a shelter-like catalog with fun interactive features like bark sounds, confetti on match, and personalized search experiences.

## 🚀 Live Demo & Code

- 🔗 **Live Site:** [https://fetch-dog-match.vercel.app/]
- 📂 **GitHub Repo:** (https://github.com/sravya-26/fetch-dog-match)

### General Functionality

- **Login page** – user provides name and email to authenticate.
- **Authenticated requests** – using `withCredentials: true`.
- **Search page** – main page to explore adoptable dogs.
- **Breed Filter** – filter results by breed.
- **Pagination** – navigate results with Prev / Next / Pages.
- **Sorting** – ASC/DESC toggle on breed field.
- **Dog Info** – displays all dog fields (img, name, age, zip, breed).
- **Favorites** – add/remove dogs to a favorites list.
- **Matching Feature** – find your perfect match using `/dogs/match`.

## Extra Features Implemented

| Feature                         | Description                                                             |
|-------------------------------|---------------------------------------------------------------------------|
| Bark Sound                 | Plays bark when adding a dog to favorites.                                |
| Confetti on Match         | Fun animation when a match is found.                                       |
| Recently Viewed           | Shows the last 10 dogs viewed via flip interaction.                        |
| Search History            | Maintains field-specific history for ZIP, Min Age, and Max Age inputs.     |
| History Deletion          | Remove specific past search terms directly from dropdown.                  |
| Fully Responsive          | Designed to work seamlessly on mobile and desktop.                         |
| Robust Validation         | ZIP code and age filters are validated with clear error messages.          |
| Scroll to Match           | Smooth scroll to matched dog card.                                         |
| Clear Filters Button      | Resets all active filters instantly. (optional if implemented)             |


## Concepts Used

- **React Hooks** – `useState`, `useEffect`, `useRef`
- **Axios** – API integration with cookie-based auth (`withCredentials`)
- **React Router** – routing between login and search pages
- **Responsive CSS** – media queries and adaptive layout styles
- **Event Handling** – dropdowns, flip cards, animations
- **Component Design** – reusable UI logic (e.g., `InputHistoryDropdown`)
- **Canvas Confetti** – for match celebration
- **Audio Playback** – barking sound on favorite action



## Tech Stack

- **Frontend:** React.js
- **HTTP Requests:** Axios
- **Routing:** React Router
- **Animations:** canvas-confetti
- **Audio:** HTML5 Audio API
- **Styling:** CSS3 (no libraries)
- **Deployment:** Vercel


## Running Locally

```bash
# Clone the repository
git clone https://github.com/sravya-26/fetch-dog-match
cd fetch-dog-match

# Install dependencies
npm install

# Install confetti package
npm install canvas-confetti

# Start the app
npm start


📁 Folder Structure

📦 FETCH-DOG-MATCH-2
├── 📁 node_modules
├── 📁 public
│   ├── 📄 bark.mp3             # Sound file for favorites
│   └── 📄 index.html           # App root HTML
├── 📁 src
│   ├── 📁 components           # Main UI components
│   │   ├── 📄 DogSearch.jsx
│   │   ├── 📄 DogSearch.css
│   │   ├── 📄 Login.jsx
│   │   └── 📄 Login.css
│   ├── 📄 App.jsx              # Main app wrapper
│   ├── 📄 index.js            # React entry point
│   └── 📄 style.css           # Global styles
├── 📄 package.json
├── 📄 package-lock.json
└── 📄 README.md               # You're here!


📃 API Docs Used (Fetch Take-Home)
/auth/login – login
/auth/logout – logout
/dogs/breeds – get all breeds
/dogs/search – search with filters and sort
/dogs – get dog details by ID
/dogs/match – get best match from favorites
/locations – fetch city/state info based on zip


📬 Contact
Created by Sravya Koyi
LinkedIn URL - https://www.linkedin.com/in/sravyakoyi/
email address - sravyakoyi26@gmail.com
