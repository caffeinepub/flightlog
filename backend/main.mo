import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
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

  let userProfiles = Map.empty<Principal, UserProfile>();
  let students = Map.empty<Principal, Map.Map<Text, Category>>();
  let instructors = Map.empty<Principal, Map.Map<Text, Category>>();
  let aircraft = Map.empty<Principal, Map.Map<Text, Category>>();
  let exercises = Map.empty<Principal, Map.Map<Text, Category>>();
  let flightLogs = Map.empty<Principal, Map.Map<Nat, FlightEntry>>();

  // User profile functions

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
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
        Runtime.trap("Invalid category type");
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
        Runtime.trap("Invalid category type");
      };
    };
  };

  public query ({ caller }) func listCategories(categoryType : Text) : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list categories");
    };
    switch (categoryType) {
      case ("student") {
        let categoryMap = getCategoryMap(students, caller);
        return categoryMap.values().toArray();
      };
      case ("instructor") {
        let categoryMap = getCategoryMap(instructors, caller);
        return categoryMap.values().toArray();
      };
      case ("aircraft") {
        let categoryMap = getCategoryMap(aircraft, caller);
        return categoryMap.values().toArray();
      };
      case ("exercise") {
        let categoryMap = getCategoryMap(exercises, caller);
        return categoryMap.values().toArray();
      };
      case (_) { return [] : [Category] };
    };
  };

  public shared ({ caller }) func addFlightEntry(entry : FlightEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add flight entries");
    };
    let newEntry = entry;
    let currentTime : Int = Time.now();
    let flightMap = switch (flightLogs.get(caller)) {
      case (null) { Map.empty<Nat, FlightEntry>() };
      case (?flights) { flights };
    };
    flightMap.add(currentTime.toNat(), newEntry);
    flightLogs.add(caller, flightMap);
  };

  public query ({ caller }) func getFlightEntries(
    filterMonth : ?Text,
    filterStudent : ?Text
  ) : async [FlightEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get flight entries");
    };

    let entries = switch (flightLogs.get(caller)) {
      case (null) { Map.empty<Nat, FlightEntry>() };
      case (?flights) { flights };
    };

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
};
