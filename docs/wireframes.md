# User Interface & Wireframes

This document provides detailed information about the user interface layouts and wireframes of the BumpData application.

## Application Layout

BumpData follows a modular layout design with several key pages and components:

### 1. Authentication Page

The authentication page provides options for users to sign up, sign in, or access the application as a guest.

**Key Components:**
- Sign In / Sign Up toggler
- Email and password fields
- Guest access button
- Application logo and welcome text
- Remember me checkbox
- Error messages for validation

### 2. Main Dashboard

The main dashboard serves as the central hub after authentication, providing access to datasets and analysis features.

**Key Components:**
- Navigation sidebar
- Dataset list with metadata (name, size, date uploaded)
- Upload new dataset button
- Theme toggle (light/dark mode)
- User profile dropdown
- Quick actions panel

### 3. Upload Screen

The upload screen allows users to add new datasets to the system.

**Key Components:**
- File upload dropzone
- File type restrictions
- Progress indicator
- Dataset preview
- Schema detection and column type mapping
- Cancel/Submit buttons

### 4. Analysis Configuration

This screen enables users to configure analysis parameters before running a technique.

**Key Components:**
- Target column selector
- Available techniques panel (filtered by column type)
- Technique details and descriptions
- Parameter configuration panels
- Run button

### 5. Results Dashboard

The results dashboard displays analysis outputs in various formats.

**Key Components:**
- Results filtering tabs (charts, tables, stats, text)
- Visualization panels
- Export options
- Share functionality
- Result explanations
- Related techniques suggestions

### 6. Admin Panel

The admin panel provides user management capabilities for administrators.

**Key Components:**
- User list with roles and status
- User activity metrics
- System health indicators
- Settings configuration options

## Navigation Flow

Users typically navigate through the application in the following sequence:

1. Authentication → Dashboard
2. Dashboard → Upload (if no datasets exist)
3. Dashboard → Dataset selection → Analysis configuration
4. Analysis configuration → Results dashboard
5. Results dashboard → Further analysis or return to dashboard

## Responsive Design

BumpData is designed to be fully responsive, with the following breakpoints:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

The layout adapts to different screen sizes by:
- Collapsing the sidebar on smaller screens
- Stacking components vertically on mobile
- Adjusting visualization sizes based on available space
- Using responsive typography

## Theme Customization

The application supports both light and dark themes, controlled by:
- Manual toggle in the top navigation bar
- System preference detection
- User preference stored in profile settings

The color palette is consistent across themes, with appropriate contrast adjustments for accessibility.

## Key UI Components

### Cards

Cards are used extensively to present:
- Dataset information
- Analysis technique options
- Result visualizations
- Statistics and metrics

### Navigation

The primary navigation includes:
- Top bar with user information and global actions
- Sidebar with main application sections
- Breadcrumbs for deep navigation paths

### Forms

Form elements follow consistent styling with:
- Clear labels
- Validation indicators
- Helpful placeholder text
- Consistent button styling
- Error messages

### Tables

Tables are used for:
- Dataset previews
- Result displays
- Administrative information
- Comparison views

### Charts

Multiple chart types are supported:
- Bar charts
- Line charts
- Scatter plots
- Pie charts
- Area charts
- Custom visualization formats for specific techniques
