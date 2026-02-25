import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module FlightEntry {
    public func compareByTime(f1 : FlightEntry, f2 : FlightEntry) : Order.Order {
      Nat.compare(f1.dateEpoch, f2.dateEpoch);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  public type Category = {
    name : Text;
  };

  public type FlightEntry = {
    date : Text;
    dateEpoch : Nat;
    student : Text;
    instructor : Text;
    aircraft : Text;
    flightType : { #solo; #dual };
    exercise : Text;
    takeoffTime : Text;
    landingTime : Text;
    totalFlightTime : Text;
    landingType : { #day; #night };
    landingCount : Nat;
  };

  public type AircraftSummary = {
    aircraft : Text;
    totalFlightHours : Float;
  };

  public type StudentTotalHours = {
    student : Text;
    totalFlightHours : Float;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let students = Map.empty<Principal, Map.Map<Text, Category>>();
  let instructors = Map.empty<Principal, Map.Map<Text, Category>>();
  let aircraft = Map.empty<Principal, Map.Map<Text, Category>>();
  let exercises = Map.empty<Principal, Map.Map<Text, Category>>();
  let flightLogs = Map.empty<Principal, Map.Map<Nat, FlightEntry>>();

  // User profile functions

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Helper function to get or create category map for a principal
  func getCategoryMap(map : Map.Map<Principal, Map.Map<Text, Category>>, caller : Principal) : Map.Map<Text, Category> {
    switch (map.get(caller)) {
      case (null) { Map.empty<Text, Category>() };
      case (?categories) { categories };
    };
  };

  func updateCategoryMap(map : Map.Map<Principal, Map.Map<Text, Category>>, caller : Principal, categories : Map.Map<Text, Category>) {
    map.add(caller, categories);
  };

  public shared ({ caller }) func addCategory(categoryType : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add categories");
    };
    let category = { name };
    switch (categoryType) {
      case ("student") {
        let categoryMap = getCategoryMap(students, caller);
        categoryMap.add(name, category);
        updateCategoryMap(students, caller, categoryMap);
      };
      case ("instructor") {
        let categoryMap = getCategoryMap(instructors, caller);
        categoryMap.add(name, category);
        updateCategoryMap(instructors, caller, categoryMap);
      };
      case ("aircraft") {
        let categoryMap = getCategoryMap(aircraft, caller);
        categoryMap.add(name, category);
        updateCategoryMap(aircraft, caller, categoryMap);
      };
      case ("exercise") {
        let categoryMap = getCategoryMap(exercises, caller);
        categoryMap.add(name, category);
        updateCategoryMap(exercises, caller, categoryMap);
      };
      case (_) {
        assert (false);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(categoryType : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete categories");
    };
    switch (categoryType) {
      case ("student") {
        let categoryMap = getCategoryMap(students, caller);
        categoryMap.remove(name);
        updateCategoryMap(students, caller, categoryMap);
      };
      case ("instructor") {
        let categoryMap = getCategoryMap(instructors, caller);
        categoryMap.remove(name);
        updateCategoryMap(instructors, caller, categoryMap);
      };
      case ("aircraft") {
        let categoryMap = getCategoryMap(aircraft, caller);
        categoryMap.remove(name);
        updateCategoryMap(aircraft, caller, categoryMap);
      };
      case ("exercise") {
        let categoryMap = getCategoryMap(exercises, caller);
        categoryMap.remove(name);
        updateCategoryMap(exercises, caller, categoryMap);
      };
      case (_) {
        assert (false);
      };
    };
  };

  func getCategoryMapForQuery(map : Map.Map<Principal, Map.Map<Text, Category>>, caller : Principal) : Map.Map<Text, Category> {
    switch (map.get(caller)) {
      case (null) { Map.empty<Text, Category>() };
      case (?categories) { categories };
    };
  };

  public query ({ caller }) func listCategories(categoryType : Text) : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list categories");
    };
    switch (categoryType) {
      case ("student") {
        let categoryMap = getCategoryMapForQuery(students, caller);
        return categoryMap.values().toArray();
      };
      case ("instructor") {
        let categoryMap = getCategoryMapForQuery(instructors, caller);
        return categoryMap.values().toArray();
      };
      case ("aircraft") {
        let categoryMap = getCategoryMapForQuery(aircraft, caller);
        return categoryMap.values().toArray();
      };
      case ("exercise") {
        let categoryMap = getCategoryMapForQuery(exercises, caller);
        return categoryMap.values().toArray();
      };
      case (_) { return [] : [Category] };
    };
  };

  func getOrCreateFlightMap(caller : Principal) : Map.Map<Nat, FlightEntry> {
    switch (flightLogs.get(caller)) {
      case (null) { Map.empty<Nat, FlightEntry>() };
      case (?flights) { flights };
    };
  };

  public shared ({ caller }) func addFlightEntry(entry : FlightEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add flight entries");
    };
    let currentTime : Int = Time.now();
    let flightMap = getOrCreateFlightMap(caller);
    flightMap.add(currentTime.toNat(), entry);
    flightLogs.add(caller, flightMap);
  };

  public shared ({ caller }) func updateFlightEntry(entryId : Nat, updatedEntry : FlightEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update flight entries");
    };

    let flightMap = switch (flightLogs.get(caller)) {
      case (null) { Runtime.trap("No flight log found") };
      case (?map) { map };
    };

    if (not flightMap.containsKey(entryId)) {
      Runtime.trap("Flight entry with id " # entryId.toText() # " does not exist");
    };

    flightMap.add(entryId, updatedEntry);
    flightLogs.add(caller, flightMap);
  };

  public query ({ caller }) func getFlightEntry(entryId : Nat) : async ?FlightEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view flight entries");
    };
    let flightMap = getOrCreateFlightMap(caller);
    flightMap.get(entryId);
  };

  func getFlightEntriesForQuery(caller : Principal) : Map.Map<Nat, FlightEntry> {
    switch (flightLogs.get(caller)) {
      case (null) { Map.empty<Nat, FlightEntry>() };
      case (?flights) { flights };
    };
  };

  public query ({ caller }) func getFlightEntries(
    filterMonth : ?Text,
    filterStudent : ?Text,
  ) : async [FlightEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view flight entries");
    };

    let entries = getFlightEntriesForQuery(caller);

    entries.values().toArray().filter(func(entry) {
      let monthMatch = switch (filterMonth) {
        case (null) { true };
        case (?month) { entry.date.startsWith(#text month) };
      };
      let studentMatch = switch (filterStudent) {
        case (null) { true };
        case (?student) { entry.student == student };
      };
      monthMatch and studentMatch;
    }).sort(FlightEntry.compareByTime);
  };

  public shared ({ caller }) func deleteFlightEntry(entryId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete flight entries");
    };

    let flightMap = switch (flightLogs.get(caller)) {
      case (null) { Runtime.trap("No flight log found") };
      case (?map) { map };
    };

    assert (flightMap.containsKey(entryId));

    flightMap.remove(entryId);
    flightLogs.add(caller, flightMap);
  };

  /**
   * Computes total flight hours per aircraft by aggregating the caller's flight entries.
   * Groups by aircraft name and sums total flight time per aircraft.
   * Returns an array of aircraft summaries with total hours.
   */
  public query ({ caller }) func getTotalFlightHoursByAircraft() : async [AircraftSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view flight hour summaries");
    };

    let userFlights = switch (flightLogs.get(caller)) {
      case (null) { Map.empty<Nat, FlightEntry>() };
      case (?flights) { flights };
    };

    let totals = Map.empty<Text, Float>();

    for ((_, entry) in userFlights.entries()) {
      let hours = parseTime(entry.totalFlightTime);
      let currentTotal = switch (totals.get(entry.aircraft)) {
        case (null) { 0.0 };
        case (?sum) { sum };
      };
      totals.add(entry.aircraft, currentTotal + hours);
    };

    totals.entries().toArray().map(func((aircraftName, totalHours)) { { aircraft = aircraftName; totalFlightHours = totalHours } });
  };

  /**
   * Computes total flight hours per student by aggregating the caller's flight entries.
   * Groups by student name and sums total flight time per student.
   * Returns an array of student summaries with total hours.
   */
  public query ({ caller }) func getTotalFlightHoursByStudent() : async [StudentTotalHours] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view flight hour summaries");
    };

    let userFlights = switch (flightLogs.get(caller)) {
      case (null) { Map.empty<Nat, FlightEntry>() };
      case (?flights) { flights };
    };

    let totals = Map.empty<Text, Float>();

    for ((_, entry) in userFlights.entries()) {
      let hours = parseTime(entry.totalFlightTime);
      let currentTotal = switch (totals.get(entry.student)) {
        case (null) { 0.0 };
        case (?sum) { sum };
      };
      totals.add(entry.student, currentTotal + hours);
    };

    totals.entries().toArray().map(func((studentName, totalHours)) { { student = studentName; totalFlightHours = totalHours } });
  };

  func parseTime(time : Text) : Float {
    let parts = time.split(#char ':');
    let timeArray = parts.toArray();
    if (timeArray.size() != 2) { 0.0 } else {
      let hours = switch (Nat.fromText(timeArray[0])) {
        case (null) { 0 };
        case (?h) { h };
      };
      let minutes = switch (Nat.fromText(timeArray[1])) {
        case (null) { 0 };
        case (?m) { m };
      };
      let totalMinutes = (hours * 60 + minutes).toFloat();
      totalMinutes / 60.0;
    };
  };
};
