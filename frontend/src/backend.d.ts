import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FlightEntry {
    totalFlightTime: string;
    instructor: string;
    date: string;
    dateEpoch: bigint;
    exercise: string;
    flightType: Variant_dual_solo;
    aircraft: string;
    student: string;
    takeoffTime: string;
    landingTime: string;
    landingType: Variant_day_night;
    landingCount: bigint;
}
export interface Category {
    name: string;
}
export interface AircraftSummary {
    totalFlightHours: number;
    aircraft: string;
}
export interface UserProfile {
    name: string;
}
export interface StudentTotalHours {
    totalFlightHours: number;
    student: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_day_night {
    day = "day",
    night = "night"
}
export enum Variant_dual_solo {
    dual = "dual",
    solo = "solo"
}
export interface backendInterface {
    addCategory(categoryType: string, name: string): Promise<void>;
    addFlightEntry(entry: FlightEntry): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCategory(categoryType: string, name: string): Promise<void>;
    deleteFlightEntry(entryId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFlightEntries(filterMonth: string | null, filterStudent: string | null): Promise<Array<FlightEntry>>;
    getFlightEntry(entryId: bigint): Promise<FlightEntry | null>;
    /**
     * / * Computes total flight hours per aircraft by aggregating the caller's flight entries.
     * /    * Groups by aircraft name and sums total flight time per aircraft.
     * /    * Returns an array of aircraft summaries with total hours.
     */
    getTotalFlightHoursByAircraft(): Promise<Array<AircraftSummary>>;
    /**
     * / * Computes total flight hours per student by aggregating the caller's flight entries.
     * /    * Groups by student name and sums total flight time per student.
     * /    * Returns an array of student summaries with total hours.
     */
    getTotalFlightHoursByStudent(): Promise<Array<StudentTotalHours>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listCategories(categoryType: string): Promise<Array<Category>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateFlightEntry(entryId: bigint, updatedEntry: FlightEntry): Promise<void>;
}
