# Sprint Planning

## Introduction

Sprint Planning is a fundamental Scrum ceremony conducted at the beginning of each sprint to determine the sprint goal, prioritise user stories, estimate development effort, assign responsibilities, and define the expected working increment. It provides the development team with a clear understanding of the work to be completed during the sprint while ensuring that all members share a common objective.

For the **Fitness Workout Tracker** project, the team adopted an iterative and incremental development approach by dividing the project into three sprints. Each sprint introduced additional functionality while continuously improving the Calendar Feature, BMI Calculator & Recommendation System, and Achievement Badge System. At the beginning of every sprint, the Product Owner prioritised the product backlog, the Scrum Master facilitated the sprint planning meeting, and the development team estimated the workload before committing to the sprint backlog.

This planning process enabled the team to maintain a structured workflow, improve collaboration, minimise development risks, and deliver a functional working increment at the end of each sprint.

---

# Sprint 1 Planning

## Sprint Duration

| Item | Description |
|------|-------------|
| Sprint | Sprint 1 |
| Duration | One Weeks |
| Objective | Develop the basic version of all three new modules |

---

## Sprint Goal

Introduce all three new features with basic functionality while integrating them into the existing Fitness Workout Tracker application.

---

## Sprint Planning Meeting

The Sprint 1 Planning meeting was attended by all team members. During the meeting, the Product Owner introduced the prioritised product backlog and explained the project requirements. The Scrum Master facilitated task discussions, estimated development effort, assigned responsibilities, and ensured that every member understood the sprint objectives before implementation began.

---

## Sprint Objectives

The primary objective of Sprint 1 was to establish the foundation of the three new modules by implementing their core functionalities. The team focused on delivering a Minimum Viable Product (MVP) that allowed users to interact with the Calendar, BMI Calculator, and Achievement Badge System successfully.

---

## Planned Features

### Calendar Feature

- Monthly calendar view
- Display scheduled workouts
- View workout details by selecting a date

### BMI Calculator

- Input height and weight
- Calculate BMI value
- Display BMI category

### Achievement Badge System

- Create basic achievement badges
- Unlock badges based on workout completion
- Display earned badges

---

## Sprint Backlog

The Product Owner prioritised the product backlog according to project requirements and team capacity. The following user stories were selected for Sprint 1.

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-12 | As a user, I want to calculate my BMI so that I can understand my current health status. | High | Planned |
| US-13 | As a user, I want to schedule workouts using a calendar so that I can organise my exercise plan effectively. | High | Planned |
| US-14 | As a user, I want to earn achievement badges so that I stay motivated to complete my workouts. | High | Planned |

---

## Team Responsibilities

| Team Member | Scrum Role | Responsibility |
|-------------|------------|----------------|
| Abbie Song | Product Owner | BMI Calculator & Recommendation |
| Goh Tse Thing | Scrum Master | UI/UX Design & Front-End Integration |
| Cheng Shu Wen | Developer | Calendar Feature |
| Fion Yap Qian Wen | Developer | Achievement Badge System |

---

## Acceptance Criteria

Sprint 1 will be considered successful if:

- Users can calculate BMI accurately using valid height and weight inputs.
- Users can view scheduled workouts on a monthly calendar.
- Users can select a calendar date to display workout details.
- Users can unlock and display achievement badges after completing workouts.
- All three modules are successfully integrated into the Fitness Workout Tracker application.
- The application passes functional testing without critical errors.

---

## Risk Assessment

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| Integration issues between modules | High | Perform continuous integration testing throughout development. |
| UI inconsistency | Medium | Apply standardised UI guidelines across all modules. |
| Development delays | Medium | Monitor progress during daily stand-up meetings and adjust task allocation when necessary. |
| Feature integration conflicts | Medium | Conduct regular code reviews and merge testing through GitHub. |

---

## Expected Working Increment

At the end of Sprint 1, the team expected to deliver:

- Functional Monthly Calendar module
- Functional BMI Calculator
- Basic Achievement Badge System
- Initial integration of all three modules into the existing Fitness Workout Tracker application

---

## Evidence

### Evidence 1: Sprint 1 Planning

Figure 1 shows the Sprint 1 planning document, including the sprint goal, planned features, and assigned member responsibilities.

![Sprint 1 Planning](images/Sprint1(1).png)

![Sprint 1 Planning](images/Sprint1(2).png)

*Figure 1. Sprint 1 planning document showing sprint goals, planned features, and team responsibilities.*

---

# Sprint 2 Planning

## Sprint Duration

| Item | Description |
|------|-------------|
| Sprint | Sprint 2 |
| Duration | One Weeks |
| Objective | Enhance the functionality, usability, and user experience of the modules developed during Sprint 1 |

---

## Sprint Goal

Enhance the three core features by improving functionality, usability, and user experience while maintaining system stability and performance.

---

## Sprint Planning Meeting

Before Sprint 2 commenced, the Scrum team conducted a Sprint Planning meeting to evaluate the outcomes of Sprint 1 and identify areas for improvement. The Product Owner reviewed stakeholder feedback and reprioritised the product backlog based on user needs. The Scrum Master facilitated workload estimation, coordinated task allocation, and ensured that all planned enhancements could be completed within the sprint duration.

---

## Sprint Objectives

The primary objective of Sprint 2 was to enhance the core functionality introduced in Sprint 1 by improving usability and adding more practical features. The team focused on expanding the Calendar module, improving the BMI Calculator with personalised recommendations, and providing users with better progress tracking through the Achievement Badge System.

---

## Planned Features

### Calendar Feature

- Weekly calendar view
- Workout filtering
- Highlight completed workouts
- Improved calendar navigation

### BMI Calculator

- Save BMI history
- Display BMI category
- Recommend suitable exercise plans
- Improve calculation validation

### Achievement Badge System

- Badge progress tracking
- Additional achievement badges
- Improved badge interface

---

## Sprint Backlog

Based on the prioritised product backlog, the following user stories were selected for Sprint 2.

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-15 | As a user, I want to save my BMI history so that I can monitor my fitness progress over time. | High | Planned |
| US-16 | As a user, I want exercise recommendations based on my BMI so that I can follow a suitable workout plan. | High | Planned |
| US-17 | As a user, I want to track badge progress so that I know how close I am to unlocking achievements. | High | Planned |

---

## Team Responsibilities

| Team Member | Scrum Role | Responsibility |
|-------------|------------|----------------|
| Abbie Song | Product Owner | BMI Enhancement |
| Goh Tse Thing | Scrum Master | UI Enhancement & Front-End Integration |
| Cheng Shu Wen | Developer | Calendar Enhancement |
| Fion Yap Qian Wen | Developer | Achievement Badge Enhancement |

---

## Acceptance Criteria

Sprint 2 will be considered successful if:

- Users can access both monthly and weekly calendar views.
- Users can filter workouts and identify completed workout sessions.
- BMI calculation history is successfully saved and displayed.
- Users receive exercise recommendations based on their BMI category.
- Badge progress is displayed accurately.
- Additional achievement badges unlock correctly after meeting the required conditions.
- All enhancements are successfully integrated without affecting existing system functionality.

---

## Risk Assessment

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| Incorrect BMI recommendation logic | High | Conduct functional testing using different BMI scenarios and validate recommendation rules. |
| Performance degradation due to additional features | Medium | Optimise database queries and improve application performance through testing. |
| Increased UI complexity | Medium | Perform usability reviews and maintain consistent interface design. |
| Feature integration conflicts | Medium | Conduct continuous integration testing and code reviews before merging. |

---

## Expected Working Increment

At the end of Sprint 2, the team expected to deliver:

- Enhanced Calendar module with weekly view and workout filtering
- BMI history management
- Personalised workout recommendation system
- Badge progress tracking and additional achievements
- Improved user interface and navigation
- Fully functional integration of all Sprint 2 enhancements

---

## Evidence

### Evidence 2: Sprint 2 Planning

Figure 2 shows the Sprint 2 planning document, including the sprint goal, enhancement features, and task allocation among team members.

![Sprint 2 Planning](images/Sprint2(1).png)

![Sprint 2 Planning](images/Sprint2(2).png)

*Figure 2. Sprint 2 planning document showing enhancement objectives, planned features, and team responsibilities.*

---

# Sprint 3 Planning

## Sprint Duration

| Item | Description |
|------|-------------|
| Sprint | Sprint 3 |
| Duration | Two Weeks |
| Objective | Integrate all features into a complete and personalised Fitness Workout Tracker application |

---

## Sprint Goal

Integrate all project features into a complete and personalised fitness planner by connecting the Calendar Feature, BMI Calculator & Recommendation System, and Achievement Badge System into a unified workflow.

---

## Sprint Planning Meeting

The Sprint 3 Planning meeting focused on the final integration of all project modules and system refinement. The Product Owner prioritised the remaining high-value user stories and verified that all planned functionalities aligned with the project objectives. The Scrum Master facilitated sprint planning, coordinated integration tasks, estimated the remaining workload, and ensured that each team member clearly understood their responsibilities before implementation.

The development team also identified module dependencies, discussed integration strategies, and prepared testing activities to ensure a stable final release.

---

## Sprint Objectives

The primary objective of Sprint 3 was to transform the developed modules into a fully integrated and personalised fitness management application. Rather than introducing many new standalone features, Sprint 3 focused on improving system integration, enhancing user experience, refining existing functionalities, and preparing the application for final deployment.

---

## Planned Features

### Calendar Feature

- Monthly workout summary graph
- Display recommended workouts from BMI recommendations
- Improve calendar performance and navigation

### BMI Calculator

- Set target BMI
- Display progress toward target BMI
- Improve recommendation accuracy
- Optimise BMI calculations

### Achievement Badge System

- Bronze, Silver, and Gold badge levels
- BMI-related achievement badges
- Improved badge integration with workout completion

---

## Sprint Backlog

Based on the prioritised product backlog and remaining project requirements, the following user stories were selected for Sprint 3.

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-18 | As a user, I want to set a target BMI so that I can achieve my personal fitness goals. | High | Planned |
| US-19 | As a user, I want to monitor my progress towards my target BMI so that I remain motivated during my fitness journey. | High | Planned |
| US-20 | As a user, I want advanced achievement badges so that my long-term workout consistency is recognised and rewarded. | High | Planned |

---

## Team Responsibilities

| Team Member | Scrum Role | Responsibility |
|-------------|------------|----------------|
| Abbie Song | Product Owner | BMI Integration & Final Recommendation Enhancement |
| Goh Tse Thing | Scrum Master | UI Polish, System Integration & Front-End Optimisation |
| Cheng Shu Wen | Developer | Calendar Integration & Workout Summary |
| Fion Yap Qian Wen | Developer | Achievement Badge Integration & Badge Levels |

---

## Acceptance Criteria

Sprint 3 will be considered successful if:

- Users can set and update their target BMI successfully.
- Users can monitor progress towards their target BMI accurately.
- Recommended workouts are automatically integrated into the calendar.
- Monthly workout summaries are displayed correctly.
- Bronze, Silver, and Gold achievement badges unlock according to predefined conditions.
- BMI-related badges are awarded correctly based on user achievements.
- All project modules are fully integrated without functional conflicts.
- The application passes integration testing and is ready for final demonstration.

---

## Risk Assessment

| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| Integration conflicts between modules | High | Perform continuous integration testing and resolve conflicts before deployment. |
| Data synchronisation issues | High | Validate data flow between Calendar, BMI Calculator, and Achievement Badge modules through comprehensive testing. |
| Performance degradation after full integration | Medium | Optimise application performance and remove redundant processes. |
| Final deployment issues | Medium | Conduct system testing, regression testing, and user acceptance testing before project submission. |

---

## Expected Working Increment

At the end of Sprint 3, the team expected to deliver:

- Fully integrated Fitness Workout Tracker application
- Personalised BMI goal tracking system
- Monthly workout summary dashboard
- Calendar integrated with personalised workout recommendations
- Bronze, Silver, and Gold achievement badge system
- BMI-related achievement badges
- Improved user interface and application performance
- Final production-ready working prototype

---

## Release Readiness

Before completing Sprint 3, the team planned to perform several quality assurance activities to ensure the system was ready for demonstration and submission.

The planned activities included:

- Functional testing for all implemented features
- Integration testing across all project modules
- User interface consistency review
- Performance optimisation
- Bug fixing and regression testing
- Final code review through GitHub Pull Requests
- Preparation of the final project demonstration

---

## Evidence

### Evidence 3: Sprint 3 Planning

Figure 3 shows the Sprint 3 planning document, including the integration objectives, planned activities, and final feature allocation.

![Sprint 3 Planning](images/Sprint3(1).png)

![Sprint 3 Planning](images/Sprint3(2).png)

*Figure 3. Sprint 3 planning document showing system integration objectives, planned features, and team responsibilities.*

---

# Conclusion

Sprint Planning played a critical role in organising the development process throughout the project. Before each sprint, the Product Owner prioritised the product backlog, the Scrum Master facilitated planning activities, and the development team estimated workloads and committed to achievable sprint goals.

By dividing the project into three iterative sprints, the team progressively delivered functional working increments, enhanced existing features, and successfully integrated all modules into a complete Fitness Workout Tracker application. The structured sprint planning process improved communication, reduced development risks, ensured balanced task distribution, and enabled continuous delivery in accordance with Scrum Agile principles.

Overall, the Sprint Planning activities provided a clear development roadmap that guided the team from the initial implementation of core features to the successful delivery of a fully integrated and personalised fitness management system.

# Appendix

## Evidence Summary

The following figures provide evidence of the Sprint Planning activities conducted throughout the project.

| Figure | Description |
|--------|-------------|
| Figure 1 | Sprint 1 planning document showing sprint goals, planned features, and member responsibilities. |
| Figure 2 | Sprint 2 planning document showing enhancement planning and task allocation. |
| Figure 3 | Sprint 3 planning document showing system integration planning and final feature allocation. |

---

## Scrum Planning Summary

Across the three iterations, the team consistently followed the Scrum Sprint Planning process.

Each Sprint Planning meeting included:

- Review of the Product Backlog
- Selection of Sprint Backlog items
- Definition of Sprint Goals
- Task estimation and workload discussion
- Assignment of member responsibilities
- Identification of project risks
- Definition of the expected working increment

These planning activities ensured that each sprint delivered a meaningful software increment while maintaining alignment with the project objectives and Agile development principles.

---

## Supporting Evidence

The following project artefacts support the Sprint Planning documentation:

- Sprint Planning Documents
- GitHub Issues
- GitHub Project Board
- GitHub Milestones 
- Sprint Task Allocation

These artefacts demonstrate that Sprint Planning activities were conducted before each iteration and that the planned tasks were distributed among team members according to their Scrum roles.