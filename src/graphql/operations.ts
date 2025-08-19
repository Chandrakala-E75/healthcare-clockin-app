// src/graphql/operations.ts
import { gql } from '@apollo/client';

// User Operations
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      picture
      role
      createdAt
    }
  }
`;

export const CREATE_OR_UPDATE_USER = gql`
  mutation CreateOrUpdateUser(
    $email: String!
    $name: String
    $picture: String
    $role: String
    $auth0Id: String
  ) {
    createOrUpdateUser(
      email: $email
      name: $name
      picture: $picture
      role: $role
      auth0Id: $auth0Id
    ) {
      id
      email
      name
      picture
      role
    }
  }
`;

// Clock Operations
export const CLOCK_IN = gql`
  mutation ClockIn(
    $note: String
    $latitude: Float!
    $longitude: Float!
    $address: String
  ) {
    clockIn(
      note: $note
      latitude: $latitude
      longitude: $longitude
      address: $address
    ) {
      id
      clockInTime
      clockInNote
      clockInLocation
      isActive
      user {
        name
        email
      }
    }
  }
`;

export const CLOCK_OUT = gql`
  mutation ClockOut(
    $clockRecordId: String!
    $note: String
    $latitude: Float!
    $longitude: Float!
    $address: String
  ) {
    clockOut(
      clockRecordId: $clockRecordId
      note: $note
      latitude: $latitude
      longitude: $longitude
      address: $address
    ) {
      id
      clockInTime
      clockOutTime
      duration
      clockInNote
      clockOutNote
      clockInLocation
      clockOutLocation
      isActive
      user {
        name
        email
      }
    }
  }
`;

// History Operations
export const GET_MY_CLOCK_RECORDS = gql`
  query GetMyClockRecords {
    myClockRecords {
      id
      clockInTime
      clockOutTime
      duration
      clockInNote
      clockOutNote
      clockInLocation
      clockOutLocation
      isActive
      createdAt
    }
  }
`;

export const GET_MY_CLOCK_STATS = gql`
  query GetMyClockStats {
    myClockStats {
      totalHours
      completedShifts
      averageShiftHours
      activeShifts
    }
  }
`;

// Manager Operations
export const GET_ALL_CLOCK_RECORDS = gql`
  query GetAllClockRecords {
    allClockRecords {
      id
      clockInTime
      clockOutTime
      duration
      clockInNote
      clockOutNote
      clockInLocation
      clockOutLocation
      isActive
      createdAt
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const GET_ACTIVE_CLOCK_RECORDS = gql`
  query GetActiveClockRecords {
    activeClockRecords {
      id
      clockInTime
      clockInNote
      clockInLocation
      isActive
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const GET_ALL_CLOCK_STATS = gql`
  query GetAllClockStats {
    allClockStats {
      totalHours
      completedShifts
      averageShiftHours
      activeShifts
    }
  }
`;

export const GET_CLOCK_RECORDS_BY_DATE_RANGE = gql`
  query GetClockRecordsByDateRange($startDate: DateTime!, $endDate: DateTime!) {
    clockRecordsByDateRange(startDate: $startDate, endDate: $endDate) {
      id
      clockInTime
      clockOutTime
      duration
      clockInNote
      clockOutNote
      isActive
      user {
        id
        name
        email
        role
      }
    }
  }
`;

// Workplace Settings Operations
export const GET_WORKPLACE_SETTINGS = gql`
  query GetWorkplaceSettings {
    workplaceSettings {
      id
      name
      latitude
      longitude
      address
      radius
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_WORKPLACE_SETTINGS = gql`
  mutation UpdateWorkplaceSettings(
    $name: String
    $latitude: Float
    $longitude: Float
    $address: String
    $radius: Int
  ) {
    updateWorkplaceSettings(
      name: $name
      latitude: $latitude
      longitude: $longitude
      address: $address
      radius: $radius
    ) {
      id
      name
      latitude
      longitude
      address
      radius
      isActive
    }
  }
`;

// Get all users (for manager dashboard)
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      email
      name
      role
      createdAt
      clockRecords {
        id
        clockInTime
        clockOutTime
        duration
        isActive
      }
    }
  }
`;