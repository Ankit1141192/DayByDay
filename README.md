# DayByDay

# 📌 Problem Statement

## **Daily Task Scheduling & Productivity Tracking Mobile Application**

### Overview

Many students and professionals plan daily study or work routines but fail to follow them consistently due to poor time management, lack of reminders, and no clear visibility of long-term progress.

The goal of this project is to develop a **mobile productivity application** that allows users to create time-based daily tasks, receive alarms when it is time to work, track task completion, and analyze consistency over time using visual indicators.

The application will be built using **React Native** and **Firebase** and will include a **Pomodoro-based focus system** as an additional productivity feature.

---

## 🎯 Objectives

* Enable users to plan structured daily routines
* Notify users when it is time to start a scheduled task
* Track task completion and skipped days
* Provide monthly progress and consistency visualization
* Encourage deep focus using the Pomodoro technique

---

## 🧩 Functional Requirements

### 1. Task Management

* Users can create daily tasks with:

  * Task title
  * Duration (in hours/minutes)
  * Start time
  * Category (optional)
* Tasks are created on a per-day basis

---

### 2. Time-Based Alerts

* The application must trigger an alarm or notification when a task’s scheduled start time is reached
* Notifications should work even when the app is in the background

---

### 3. Task Completion Tracking

* Users can mark tasks as:

  * Completed
  * Skipped
* Completion status must be stored persistently in the database

---

### 4. Monthly Progress Visualization

* The application must provide a monthly calendar view where:

  * **Green** indicates days where tasks were completed
  * **Red** indicates days where tasks were skipped
* Users should be able to view:

  * Number of completed days
  * Number of skipped days
  * Total productive hours per month

---

### 5. Data Persistence (Firebase)

* Firebase must be used for:

  * User authentication
  * Storing tasks and schedules
  * Tracking daily completion status
  * Retrieving historical progress data

---

## 🎁 Bonus Feature: Pomodoro Focus Mode

* Implement a Pomodoro timer with:

  * 25-minute focus sessions
  * 5-minute break sessions
  * Customizable time intervals
* Each task can be completed using one or more Pomodoro sessions
* The app should record:

  * Number of Pomodoro sessions per task
  * Total focus time

---

## 🛠️ Technical Stack

* **Frontend:** React Native
* **Backend & Database:** Firebase (Firestore)
* **Authentication:** Firebase Authentication
* **Notifications:** Push Notifications
* **State Management:** Context API / Redux (optional)

---
