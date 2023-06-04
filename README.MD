# Pollen Allergy Tracker

Pollen Allergy Tracker is a personal web application designed to help individuals manage and monitor their pollen allergies. It gathers information on actual and forecasted active pollen levels and their severity from the DWD API (Deutscher Wetterdienst). Users can also input and document the severity of their allergy symptoms, which is then stored on a Supabase backend. This valuable data can be provided to medical professionals to develop targeted immunotherapy treatment plans.

I created this project because I had to manually write my allergy symptoms in a physical calendar, and that process was too much effort for me 😄.

## Features

- Displays current and forecasted pollen levels and their severity
- Allows users to input and track the severity of their allergy symptoms
- Stores user-input symptom data on a secure Supabase backend
- Generates comprehensive reports that can be shared with a doctor

## Getting Started

### Prerequisites

- Basic knowledge of web development (HTML, CSS, and JavaScript)
- Access to the DWD API (no API key is required)
- A Supabase account to set up the backend

### Installation

1. Clone the Pollen Allergy Tracker repository:

git clone https://github.com/yourusername/pollen-allergy-tracker.git

2. Navigate to the project directory:

cd pollen-allergy-tracker

3. Install the required dependencies:

npm install

4. Create a `.env` file in the root folder and add your Supabase credentials:

PUBLIC_SUPABASE_EMAIL=your_supabase_email PUBLIC_SUPABASE_KEY=your_supabase_key PUBLIC_SUPABASE_PASSWORD=your_supabase_password

5. Log in to your Supabase account and create a table named `Calendar` with the following columns:
   - Datum
   - Augen
   - Nase
   - im_Haus
   - Draußen
   - Medikamente
   - Pollenflug

6. Start the development server:

npm run dev

7. Open your web browser and navigate to `http://localhost:5173` to view the website.

## Usage

1. To view the active pollen levels and forecasts, visit the homepage.
2. To log the severity of your allergy symptoms, navigate to the "My Allergy Diary" page from the menu.
3. Input the date, list of pollen allergens, and the severity of your symptoms.
4. Click the "Submit" button to save your entry to the Supabase backend.
5. Visit the "Reports" page to view a summary of your logged symptoms; you can download or print this data to share with your doctor to aid in the development of your immunotherapy plan.
