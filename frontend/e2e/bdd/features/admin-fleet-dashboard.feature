@admin-fleet
Feature: Admin login and Fleet dashboard access

  As an admin user
  I want to log in to NeuroFleetX
  So that I can access the Fleet Management dashboard

  Background:
    Given an admin user exists

  Scenario: Admin logs in and can access the Fleet dashboard
    When the admin logs in via the login page
    Then the admin should see the Fleet Management page
