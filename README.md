# Fitness Workout Tracking System
This is a web-based Fitness Workout Tracking System designed to help users manage their workout activities in a more organized and convenient way. Users can create workout programs, manage completed workouts and measure their own fitness progress in a more efficiently way due to the system's seamless and user-friendly interface. It aims to help users maintain a more active lifestyle, promote healthier habits and increase workout frequency.

---

## Student Information:
- Abbie Song (BAI_A2009F-2605003)
- Goh Tse Thing (BAI_A2009F-2605002)
- Cheng Shu Wen (BIT_A2201F-2509001)
- Fion Yap Qian Wen (BAI_A2009F-2605009)

## Table of Content
- Team Members and Roles
- Problem Statement
- Product Vision and Scope
- System Overview
- User Stories
- Features Implemented
- How to Run the System
- Technology Stack
- Scrum Process Summary
- Sprint Overview
- GitHub Usage
- Release Information
- Individual Contributions

---

## Team Members and Roles
| Name | Role | Responsibilities |
|------|------|------------|
| **Abbie** | Product Owner | 1. Defined project requirements and prioritized system features<br>2. Managed authentication and user system including login, registration and user data handling<br>3. Maintained project documentation and coordinated sprint planning |
| **TseThing** | Scrum Master | 1. Coordinated sprint workflow and team progress<br> 2. Managed UI design<br>3. Responsive layout<br>4. Filtering features and system integration testing |
| **ShuWen** | Developer | 1. Developed workout tracking and reporting system including workout completion tracking, history records, summary reports<br>2. Weight tracking features |
| **Fion** | Developer | 1. Developed workout scheduling system including add, edit, delete workout functions<br>2. Weekly schedule display |

---

## Problem Statement
**Client Scenario:**

Many individuals still rely on manual methods like notebooks, spreadsheets or memory to manage their workout routines and fitness progress. This often leads to several problems, including:
- Difficult to organize the workout schedules effectively
- Inconsistent workout tracking and progress monitoring
- Lack of structured workout planning
- Difficulty in reviewing workout history and fitness improvements

**Business Needs:**

Users need a digital fitness workout tracking system that allows them to:
- Manage workout schedules more efficiently
- Track completed workouts and fitness activities
- View workout history and weekly progress reports
- Monitor fitness records like weight changes and workout consistency

**Target Users:**
- Individuals managing personal fitness routines
- Gym beginners looking for structured workout planning
- Users who want to monitor workout progress and workout consistency

---

## Product Vision and Scope
**Our Vision**: To provide a user-friendly fitness workout tracking system that helps users plan workout schedules, monitor fitness progress and maintain a consistent and healthy lifestyle.

**Scope**:
- User registration and login
- Workout schedule management
- Add, edit and delete workout plans
- Weekly workout schedule display
- Workout completion tracking
- Workout history records
- Weekly progress reports
- Weight tracking
- Responsive design for mobile and desktop

---
## System Overview
The **Fitness Workout Tracking System** is a web based application developed to help users manage workout schedules and monitor fitness progress in a more organized and efficient way. The system replaces manual methods like notebooks or memory by providing a centralized digital platform for fitness management.

The system includes the following main functions:
- User Registration and Login to securely access personal workout information.
- Workout Schedule Management to create, edit, delete and view weekly workout plans.
- Workout Completion Tracking to record completed exercises and maintain consistency.
- Workout History and Weekly Reports to review past activities and evaluate progress.
- Weight Tracking to monitor physical changes over time.
- Responsive Design to support access from both desktop and mobile devices.

Overall, the system aims to provide users with a structured and convenient way to plan workouts, track fitness activities and maintain a healthier lifestyle.

---

## User Stories
| User Story ID | User Story | MoSCoW Priority |
|--------------|------------|----------------|
| US01 | As a gym beginner, I want to create an account and log in so that all my workout plans and progress are saved in one place instead of using paper notes. | Must Have |
| US02 | As a busy university student, I want to schedule my workouts for the week so that I can balance exercise with my classes and avoid skipping sessions. | Must Have |
| US03 | As a person trying to build a healthy habit, I want to see my weekly workout plan clearly so that I know what exercise to do each day without thinking too much. | Must Have |
| US04 | As a user who loses motivation easily, I want to mark completed workouts so that I can feel a sense of achievement and stay consistent. | Must Have |
| US05 | As a user who often changes plans, I want to edit or remove scheduled workouts so that my fitness routine stays flexible and realistic. | Should Have |
| US06 | As a user who wants visible results, I want weekly progress reports so that I can know whether my workout effort is actually helping me improve. | Should Have |
| US07 | As a user managing body fitness, I want to record my weight regularly so that I can compare changes and stay motivated. | Should Have |
| US08 | As a user who works and studies in different places, I want the system to work on both mobile and desktop so that I can update workouts anytime. | Could Have |
| US09 | As a user with many workout records, I want filtering features so that I can quickly find specific schedules or past activities. | Could Have |
| US10 | As a smartwatch user, I want to connect fitness devices so that my workout data updates automatically without manual input. | Won’t Have |
| US11 | As a social user, I want to share my workout achievements online so that I can stay motivated with friends. | Won’t Have |

---
## Features Implemented
### Iteration 1 features

✅ User Authentication system
- User registration with full name, email and password
- User login functionality
- User logout functionality

✅ Workout Scheduling System
- Add workout functionality
- Workout day selection
- Exercise selection from predefined categories
- Workout duration input
- Weekly workout schedule display

✅ Workout Tracking System
- Mark workouts as completed
- Daily workout progress tracking
- Workout completion status display
- Workout history recording
- LocalStorage data persistence

✅ User Interface
- Login and registration interface
- Navigation between pages
- Responsive and user-friendly layout


### Iteration 2 Features
✅ Enhanced Authentication & Security
- Show/Hide password functionality
- Forgot password and password reset feature
- Enhanced validation and error handling
- Improved user feedback messages

✅ Enhanced Workout Scheduling System
- Edit existing workouts
- Delete workouts from schedule
- Workout duration validation
- Improved scheduling interface

✅ Enhanced Workout Tracking & Reporting
- Weekly workout summary
- Workout history records
- Workout streak tracking
- Weight logging feature
- Workout statistics dashboard

✅ User Experience Improvements
- Enhanced user interface design
- Improved modal interactions
- Better visual feedback for completed workouts
- Responsive layout improvements

---

## How to Run the System?
### Prerequisites
- Use modern web browsers like Google Chrome and Microsoft Edge
- No additional software installation required
- No database setup required

### Steps to Run
1. Download or clone the GitHub repository
2. Open the project folder
3. Navigate to the `SE_Assignment` folder
4. Open `index.html` in a web browser
5. Register a new account or log in to access the system

### Testing the Features

**Authentication System**
- Register a new account
- Attempt to register using an existing email address
- Test login with valid and invalid credentials

**Workout Scheduling**
- Add a workout using the Add Workout button
- Select a workout type, day and duration
- Verify that the workout appears in the weekly schedule

**Data Persistence**
- Add workouts and refresh the browser
- Verify that user accounts and workout data remain available through LocalStorage

---

## Technology Stack
| Component | Technology | Purpose |
|------|------|------------|
| Frontend | HTML5 | Structure and layout of the web application |
| Styling | CSS3 | User interface design and responsive layout |
| Logic | JavaScript (ES6) | Authentication, workout management and validation |
| Storage | LocalStorage | Client-side data persistence |
| Version Control | Git & GitHub | Collaboration, version control and project management |

---

## Scrum Process Summary
### Methodology
Our team used the Scrum framework to support iterative and incremental development throughout the project.

### Scrum Practices
- **Sprint Planning**: User stories were selected and assigned at the beginning of each iteration.
- **Sprint Review**: Completed features were reviewed and demonstrated at the end of each iteration.
- **Sprint Retrospective**: Team members discussed improvements and challenges after each iteration.
- **Backlog Management**: User stories and tasks were managed using GitHub Issues.

### Tools Used
- GitHub Repository
- GitHub Issues
- GitHub Pull Requests
- GitHub Releases
- WeChat group communication

---

## Iteration Overview
### Iteration 1
**Goal**: Develop the minimum viable version of the Fitness Workout Tracking System.

Completed User Stories:
- US01
- US02
- US03

Key Deliverables:
- Basic user authentication and validation
- Workout Scheduling
- Weekly workout display
- Basic UI

**Outcomes**: Successfully delivered a functional prototype that allows users to register, log in and manage workout schedules.

---

### Iteration 2
**Goal**: Enhance functionality and improve user experience.

Completed User Stories:
- US04
- US05
- US06
- US07
- US08

Key Deliverables:
- Workout tracking system
- Workout history and reports
- Weight tracking functionality
- Enhanced validation
- Improved user interface
- Mobile and desktop responsive layout

**Outcomes**: The system was extended with tracking and reporting capabilities which provide a more complete fitness management experience.

---

## GitHub Usage
**Version Control Practices**<br>
Our team used Git and GitHub to manage source code, track development progress and support collaborative development throughout the project.

**Branching Strategy**
- `main`: Integrated and stable version of the project.
- Individual feature branches were created by team members for feature development and testing before merging changes into the main branch.

**Github Issues**
- User stories and development tasks were tracked using GitHub Issues.
- Issues were assigned according to each member's responsibilities.
- Progress was monitored throughout both iterations.

**Pull Requests**
- Changes were merged into the main branch through Pull Requests.
- Team members will review and comments before merging.
- Pull Requests provided evidence of collaboration and feature integration.

**Collaboration Evidence**
- Commit history from all team members.
- Branch development and merge activities.
- GitHub Issues and task tracking.
- Pull Request reviews and discussions.
- Iteration release tags.

---

## Release Information

### Iteration 1 Release
**Tag**: v0.1-iteration1

**Release Features**:
- User Authentication System
- Basic Input Validation
- Workout Scheduling System
- Basic Workout Tracking System
- Basic User Interface

### Iteration 2 Release
**Tag**: v0.2-iteration2

**Release Features**:
- Enhanced authentication and security
- Edit and delete workout functions
- Enhanced workout tracking and reporting
- Weight tracking functionality
- User interface improvements
- Responsive design enhancements

---

## Individual Contributions
### Abbie (Product Owner)
**Responsibilities**
- Defined project requirements and feature priorities
- Coordinated user stories and sprint planning
- Developed the Authentication and User System
- Implemented user registration, login and logout functionality
- Managed user data persistence using LocalStorage
- Maintained and updated project documentation including README.md

**Iteration Contributions**
- Iteration 1: Developed the login and registration system
- Iteration 2: Improved input validation and authentication reliability

**GitHub Contributions**
- Created and managed GitHub Issues
- Submitted Pull Requests for authentication and documentation updates

---

### TseThing (Scrum Master)
**Responsibilities**
- Coordinated Scrum activities and monitored team progress
- Designed the user interface and system layout
- Implemented workout filtering features
- Improved responsive design for mobile and desktop devices
- Conducted integration testing and system verification

**Iteration Contributions**
- Iteration 1: Developed the basic user interface structure
- Iteration 2: Improved user interface design, responsiveness and filtering functionality

**GitHub Contributions**
- Created and managed GitHub Issues
- Submitted Pull Requests for UI enhancements and system integration

---

### ShuWen (Developer)
**Responsibilities**
- Developed the Workout Tracking and Report System
- Implemented workout completion tracking
- Developed workout history and weekly summary report features
- Implemented weight tracking functionality

**Iteration Contributions**
- Iteration 1: Developed the basic workout tracking system
- Iteration 2: Enhanced reporting features and implemented weight tracking

**GitHub Contributions**
- Created and managed GitHub Issues
- Submitted Pull Requests for tracking and reporting features

---

### Fion (Developer)
**Responsibilities**
- Developed the Workout Scheduling System
- Implemented add, edit and delete workout functionalities
- Created weekly workout schedule display features

**Iteration Contributions**
- Iteration 1: Developed the basic workout scheduling system
- Iteration 2: Enhanced scheduling functionality with edit and delete features and improved user interface design

**GitHub Contributions**
- Created and managed GitHub Issues
- Submitted Pull Requests for workout scheduling features


