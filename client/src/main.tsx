import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the title and meta description for the application
document.title = "AllerScan - Food Allergen Detection App";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Scan food packaging to instantly detect allergens and food restrictions. AllerScan uses AI to help you make safer food choices based on your dietary needs.';
document.head.appendChild(metaDescription);

// Add Open Graph tags for better social sharing
const ogTitle = document.createElement('meta');
ogTitle.property = 'og:title';
ogTitle.content = 'AllerScan - Food Allergen Detection App';
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.property = 'og:description';
ogDescription.content = 'Scan food packaging to instantly detect allergens and food restrictions. AllerScan uses AI to help you make safer food choices based on your dietary needs.';
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.property = 'og:type';
ogType.content = 'website';
document.head.appendChild(ogType);

createRoot(document.getElementById("root")!).render(<App />);
