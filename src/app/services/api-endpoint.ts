/**
 * An object containing endpoint URLs for API operations.
 * `ApiEndpoints` provides a structured and constant set of paths used for constructing API requests in the application.
 *
 * Properties:
 * - `baseUrl`: The base URL shared by all API endpoints.
 * - `paths`: An object containing specific endpoint paths categorized by their usage.
 *
 * The `paths` object includes various keys representing API routes related to functionalities like employees, users, suppliers, accommodations, location details, transfer contracts, and generic services.
 *
 * Keys within the `paths` object contain predefined endpoint paths for accessing different functionalities and resources in the API.
 */

const baseUrl = 'http://localhost:8080';

export const ApiEndpoints = {
  baseUrl,
  paths: {

    dashboardCard: `${baseUrl}/dashboard/cards`,
    dashboardRecentBookings: `${baseUrl}/dashboard/recent-bookings`,
    monthlyBookingsRevenue: `${baseUrl}/booking-reports/monthly-revenue`,
    monthlyBookingsCount: `${baseUrl}/booking-reports/monthly-bookings`,
    monthlyBookingsTrend: `${baseUrl}/booking-reports/monthly-bookings-trend`,

    totalBookingTourCountReport: `${baseUrl}/tour-reports/total-tours`,
    monthlyBookingTourCountReport: `${baseUrl}/tour-reports/monthly-tours`,

    paymentCollectionReport: `${baseUrl}/payment-collection-reports`,
    inComeAndRevenueReport: `${baseUrl}/income-and-revenue-reports`,

    tourOccupancyReport: `${baseUrl}/tour-occupancy-reports`,

    profitByTourTypeReport: `${baseUrl}/profits-by-tour/types`,
    profitByTourCategoryReport: `${baseUrl}/profits-by-tour/categories`,
    profitByTourThemeReport: `${baseUrl}/profits-by-tour/theme`,
    profitByTourRevenueReport: `${baseUrl}/profits-by-tour/tour-revenue`,

    regexes: `${baseUrl}/regexes`,

    employees: `${baseUrl}/employees`,
    employeeByUsername: `${baseUrl}/employees/employee-by-username`,
    employeeList: `${baseUrl}/employees/list`,
    employeeTypes: `${baseUrl}/employeetypes`,
    employeeStatuses: `${baseUrl}/employeestatuses`,
    employeeNumber: `${baseUrl}/employees/employee-number`,
    employeeForUserDetails: `${baseUrl}/employees/employee-for-user-details`,
    designations: `${baseUrl}/designations`,
    genders: `${baseUrl}/genders`,

    users: `${baseUrl}/users`,
    activeUsersList: `${baseUrl}/users/list`,
    userTypes: `${baseUrl}/usertypes`,
    userStatuses: `${baseUrl}/userstatuses`,
    updateUserLockStatus: `${baseUrl}/users/activateordeactivateuser`,

    privileges: `${baseUrl}/privileges`,
    roles: `${baseUrl}/roles`,
    modules: `${baseUrl}/modules`,
    operations: `${baseUrl}/operations`,

    suppliers: `${baseUrl}/suppliers`,
    activeAccommSuppliersList: `${baseUrl}/suppliers/accomm_sup_list`,
    activeTransferSuppliersList: `${baseUrl}/suppliers/transfer_sup_list`,
    activeGenericSuppliersList: `${baseUrl}/suppliers/generic_sup_list`,
    supplierBrNumber: `${baseUrl}/suppliers/supplier-br-number`,
    supplierTypes: `${baseUrl}/suppliertypes`,
    supplierStatuses: `${baseUrl}/supplierstatuses`,

    roomTypes: `${baseUrl}/roomtypes`,
    roomFacilities: `${baseUrl}/roomfacilities`,
    paxTypes: `${baseUrl}/paxtypes`,
    residentTypes: `${baseUrl}/residenttypes`,
    rateTypes: `${baseUrl}/ratetypes`,
    currencies: `${baseUrl}/currencies`,
    cancellationSchemes: `${baseUrl}/cancellationschemes`,

    accommodations: `${baseUrl}/accommodations`,
    accommodationRefNumber: `${baseUrl}/accommodations/get-next-reference`,
    accommodationStatuses: `${baseUrl}/accommodationstatuses`,
    accommodationDiscountTypes: `${baseUrl}/accommodationdiscounttypes`,
    accommodationTypes: `${baseUrl}/accommodationtypes`,
    accommodationStarRate: `${baseUrl}/accommodationstarrate`,
    accommodationSearch: `${baseUrl}/accommodations/search-accommodations`,
    availableRooms: `${baseUrl}/accommodations/available-room-count`,

    cities: `${baseUrl}/cities`,
    cityList: `${baseUrl}/cities/list`,
    cityCode: `${baseUrl}/cities/city-code`,
    provinces: `${baseUrl}/provinces`,
    districts: `${baseUrl}/districts`,
    airports: `${baseUrl}/airports`,
    airportList: `${baseUrl}/airports/list`,
    ports: `${baseUrl}/ports`,
    portList: `${baseUrl}/ports/list`,
    locations: `${baseUrl}/locations`,
    locationList: `${baseUrl}/locations/list`,
    locationCode: `${baseUrl}/locations/location-code`,
    locationTypes: `${baseUrl}/locationtypes`,

    transferContracts: `${baseUrl}/transfercontract`,
    transferRefNumber: `${baseUrl}/transfercontract/get-next-reference`,
    transferStatuses: `${baseUrl}/transferstatuses`,
    transferDiscountTypes: `${baseUrl}/transferdiscounttypes`,
    transferContractSearch: `${baseUrl}/transfercontract/search-transfer`,
    transferTypes: `${baseUrl}/transfertypes`,

    generics: `${baseUrl}/generics`,
    genericRefNumber: `${baseUrl}/generics/next-generic-reference`,
    genericStatuses: `${baseUrl}/genericstatuses`,
    genericTypes: `${baseUrl}/generictypes`,
    genericDiscountTypes: `${baseUrl}/genericdiscounttypes`,
    genericSearch: `${baseUrl}/generics/search-generics`,

    tours: `${baseUrl}/tours`,
    tourRefNumber: `${baseUrl}/tours/next-tour-reference`,
    tourTypes: `${baseUrl}/tourtypes`,
    tourCategories: `${baseUrl}/tourcategories`,
    tourThemes: `${baseUrl}/tourthemes`,
    tourSearch: `${baseUrl}/tours/search-tours`,
    tourView: `${baseUrl}/tours/tour-view`,

    customers: `${baseUrl}/customers`,
    customerList: `${baseUrl}/customers/list`,
    customerRelationshipTypes: `${baseUrl}/customerrelations`,
    customerCode: `${baseUrl}/customers/customer-code`,

    bookings: `${baseUrl}/bookings`,
    bookingList: `${baseUrl}/bookings/list`,
    bookingCode: `${baseUrl}/bookings/next-booking-code`,
    bookingStatuses: `${baseUrl}/bookingstatuses`,
    bookingItemStatuses: `${baseUrl}/bookingitemstatuses`,
    bookingBalance: `${baseUrl}/bookings/booking-balance`,
    bookingViews: `${baseUrl}/bookings/booking-view`,
    bookedRoomCount: `${baseUrl}/bookings/booked-room-count`,

    customerPayments: `${baseUrl}/customerpayments`,
    customerPaymentCode: `${baseUrl}/customerpayments/customer-payment-code`,
    customerPaymentTypes: `${baseUrl}/customerpaymenttypes`,

    supplierPayments: `${baseUrl}/supplierpayments`,
    supplierPaymentCode: `${baseUrl}/supplierpayments/supplier-payment-code`,
    supplierPaymentStatuses: `${baseUrl}/supplierpaymentstatuses`,
    supplierPaymentInfo: `${baseUrl}/supplierpayments/supplier-payment-info`,

    userPasswordUpdate: `${baseUrl}/user-details-manager/update-password`,

  }
} as const;
