import type {
  UserAccount,
  District,
  City,
  Barangay,
  FloodIncident,
  RecurrenceHotspot,
  StreetVulnerability,
  BarangayVulnerability,
  StreetRegistryEntry,
  PriorityItem,
  DashboardSummary,
} from '../types';

// ─── User Accounts ────────────────────────────────────────────────────────────

export const ACCOUNTS: UserAccount[] = [
  {
    id: 'brgy-676',
    officeName: 'Barangay 676',
    cityMunicipality: 'Manila City',
    zone: '68',
    officeContact: '+63 930 434 8364',
    officeReferenceNo: 'MLA-BRGY-0676',
    registeredEmail: 'manila.brgy.651@gov.ph',
    role: 'barangay',
    lastLogin: '2026-06-09T18:21:00',
  },
  {
    id: 'mdrrmo-manila',
    officeName: 'Manila MDRRMO',
    cityMunicipality: 'Manila City',
    region: 'NCR',
    officeContact: '+63 930 434 8364',
    officeReferenceNo: 'NCR-MDRRMO-0001',
    registeredEmail: 'manila.mdrrmo@gov.ph',
    role: 'admin',
    lastLogin: '2026-06-09T18:21:00',
  },
];

// Demo credentials (plain text for mock — real backend uses bcrypt)
export const CREDENTIALS: Record<string, { password: string; accountId: string }> = {
  'manila.brgy.651@gov.ph': { password: 'Brgy651!', accountId: 'brgy-676' },
  'manila.mdrrmo@gov.ph': { password: 'Mdrrmo2026!', accountId: 'mdrrmo-manila' },
};

// ─── Geography ────────────────────────────────────────────────────────────────

export const DISTRICTS: District[] = [
  { id: 'd1', name: 'District 1' },
  { id: 'd2', name: 'District 2' },
  { id: 'd3', name: 'District 3' },
  { id: 'd4', name: 'District 4' },
  { id: 'd5', name: 'District 5' },
  { id: 'd6', name: 'District 6' },
];

export const CITIES: City[] = [
  { id: 'c-tondo', districtId: 'd1', name: 'Tondo I and II' },
  { id: 'c-binondo', districtId: 'd2', name: 'Binondo' },
  { id: 'c-san-nicolas', districtId: 'd2', name: 'San Nicolas' },
  { id: 'c-sta-cruz', districtId: 'd3', name: 'Santa Cruz' },
  { id: 'c-sampaloc', districtId: 'd3', name: 'Sampaloc' },
  { id: 'c-sta-mesa', districtId: 'd4', name: 'Santa Mesa' },
  { id: 'c-ermita', districtId: 'd5', name: 'Ermita' },
  { id: 'c-intramuros', districtId: 'd5', name: 'Intramuros' },
  { id: 'c-malate', districtId: 'd5', name: 'Malate' },
  { id: 'c-paco', districtId: 'd5', name: 'Paco' },
  { id: 'c-portarea', districtId: 'd5', name: 'Port Area' },
];

// Barangays from the real dataset (all unique barangays referenced)
export const BARANGAYS: Barangay[] = [
  // Ermita
  { id: 'brgy-658', cityId: 'c-ermita', name: 'Barangay 658', population: 12121, lat: 14.5891, lng: 120.9835 },
  { id: 'brgy-659', cityId: 'c-ermita', name: 'Barangay 659', population: 12176, lat: 14.5899, lng: 120.9822 },
  { id: 'brgy-659a', cityId: 'c-ermita', name: 'Barangay 659-A', population: 8259, lat: 14.5915, lng: 120.9817 },
  { id: 'brgy-660a', cityId: 'c-ermita', name: 'Barangay 660-A', population: 8559, lat: 14.5838, lng: 120.9839 },
  { id: 'brgy-663', cityId: 'c-ermita', name: 'Barangay 663', population: 14690, lat: 14.5887, lng: 120.9846 },
  { id: 'brgy-666', cityId: 'c-ermita', name: 'Barangay 666', population: 9005, lat: 14.5829, lng: 120.9840 },
  { id: 'brgy-667', cityId: 'c-ermita', name: 'Barangay 667', population: 10641, lat: 14.5790, lng: 120.9807 },
  { id: 'brgy-669', cityId: 'c-ermita', name: 'Barangay 669', population: 7459, lat: 14.5822, lng: 120.9847 },
  { id: 'brgy-670', cityId: 'c-ermita', name: 'Barangay 670', population: 17012, lat: 14.5798, lng: 120.9860 },
  { id: 'brgy-674', cityId: 'c-ermita', name: 'Barangay 674', population: 9052, lat: 14.5831, lng: 120.9843 },
  { id: 'brgy-675', cityId: 'c-ermita', name: 'Barangay 675', population: 7795, lat: 14.5766, lng: 120.9880 },
  { id: 'brgy-676', cityId: 'c-ermita', name: 'Barangay 676', population: 14642, lat: 14.5801, lng: 120.9860 },
  { id: 'brgy-684', cityId: 'c-ermita', name: 'Barangay 684', population: 10245, lat: 14.5776, lng: 120.9875 },
  { id: 'brgy-689', cityId: 'c-ermita', name: 'Barangay 689', population: 10434, lat: 14.5873, lng: 120.9852 },
  { id: 'brgy-692', cityId: 'c-ermita', name: 'Barangay 692', population: 8359, lat: 14.5738, lng: 120.9897 },
  { id: 'brgy-693', cityId: 'c-malate', name: 'Barangay 693', population: 7644, lat: 14.5748, lng: 120.9890 },
  { id: 'brgy-694', cityId: 'c-ermita', name: 'Barangay 694', population: 11332, lat: 14.5774, lng: 120.9874 },
  { id: 'brgy-695', cityId: 'c-ermita', name: 'Barangay 695', population: 17018, lat: 14.5761, lng: 120.9884 },
  // Malate
  { id: 'brgy-699', cityId: 'c-malate', name: 'Barangay 699', population: 12908, lat: 14.5739, lng: 120.9831 },
  { id: 'brgy-715', cityId: 'c-malate', name: 'Barangay 715', population: 9506, lat: 14.5672, lng: 120.9891 },
  { id: 'brgy-719', cityId: 'c-malate', name: 'Barangay 719', population: 7369, lat: 14.5653, lng: 120.9898 },
  { id: 'brgy-720', cityId: 'c-malate', name: 'Barangay 720', population: 14387, lat: 14.5743, lng: 120.9948 },
  { id: 'brgy-721', cityId: 'c-malate', name: 'Barangay 721', population: 16894, lat: 14.5662, lng: 120.9884 },
  { id: 'brgy-723', cityId: 'c-malate', name: 'Barangay 723', population: 16750, lat: 14.5732, lng: 120.9918 },
  { id: 'brgy-724', cityId: 'c-malate', name: 'Barangay 724', population: 11709, lat: 14.5704, lng: 120.9918 },
  { id: 'brgy-725', cityId: 'c-malate', name: 'Barangay 725', population: 15085, lat: 14.5696, lng: 120.9910 },
  { id: 'brgy-740', cityId: 'c-malate', name: 'Barangay 740', population: 10134, lat: 14.5740, lng: 120.9945 },
  // Port Area
  { id: 'brgy-649', cityId: 'c-portarea', name: 'Barangay 649', population: 7030, lat: 14.5914, lng: 120.9589 },
  // Santa Cruz
  { id: 'brgy-196', cityId: 'c-sta-cruz', name: 'Barangay 196', population: 9796, lat: 14.6290, lng: 120.9829 },
  { id: 'brgy-313', cityId: 'c-sta-cruz', name: 'Barangay 313', population: 10116, lat: 14.6043, lng: 120.9797 },
  { id: 'brgy-349', cityId: 'c-sta-cruz', name: 'Barangay 349', population: 10953, lat: 14.6206, lng: 120.9832 },
  { id: 'brgy-368', cityId: 'c-sta-cruz', name: 'Barangay 368', population: 11950, lat: 14.6222, lng: 120.9849 },
  { id: 'brgy-372', cityId: 'c-sta-cruz', name: 'Barangay 372', population: 17911, lat: 14.6260, lng: 120.9891 },
  { id: 'brgy-376', cityId: 'c-sta-cruz', name: 'Barangay 376', population: 10069, lat: 14.6266, lng: 120.9859 },
  { id: 'brgy-378', cityId: 'c-sta-cruz', name: 'Barangay 378', population: 12773, lat: 14.6276, lng: 120.9846 },
  // Tondo
  { id: 'brgy-220', cityId: 'c-tondo', name: 'Barangay 220', population: 15101, lat: 14.6234, lng: 120.9783 },
  { id: 'brgy-226', cityId: 'c-tondo', name: 'Barangay 226', population: 8656, lat: 14.6168, lng: 120.9772 },
  { id: 'brgy-255', cityId: 'c-tondo', name: 'Barangay 255', population: 8888, lat: 14.6139, lng: 120.9766 },
  { id: 'brgy-264', cityId: 'c-tondo', name: 'Barangay 264', population: 15833, lat: 14.6104, lng: 120.9758 },
  // Sampaloc
  { id: 'brgy-421', cityId: 'c-sampaloc', name: 'Barangay 421', population: 13438, lat: 14.6050, lng: 121.0000 },
  { id: 'brgy-450', cityId: 'c-sampaloc', name: 'Barangay 450', population: 11823, lat: 14.6111, lng: 120.9946 },
  { id: 'brgy-453', cityId: 'c-sampaloc', name: 'Barangay 453', population: 9526, lat: 14.6105, lng: 120.9938 },
  { id: 'brgy-523', cityId: 'c-sampaloc', name: 'Barangay 523', population: 14368, lat: 14.6132, lng: 120.9964 },
  { id: 'brgy-530', cityId: 'c-sampaloc', name: 'Barangay 530', population: 16231, lat: 14.6170, lng: 120.9985 },
  // Santa Mesa
  { id: 'brgy-586', cityId: 'c-sta-mesa', name: 'Barangay 586', population: 11550, lat: 14.6039, lng: 121.0168 },
  { id: 'brgy-594', cityId: 'c-sta-mesa', name: 'Barangay 594', population: 11960, lat: 14.6029, lng: 121.0159 },
  { id: 'brgy-598', cityId: 'c-sta-mesa', name: 'Barangay 598', population: 13939, lat: 14.6010, lng: 121.0202 },
  // Binondo
  { id: 'brgy-240', cityId: 'c-binondo', name: 'Barangay 240', population: 11106, lat: 14.6063, lng: 120.9749 },
  { id: 'brgy-266', cityId: 'c-binondo', name: 'Barangay 266', population: 10983, lat: 14.6060, lng: 120.9749 },
  { id: 'brgy-289', cityId: 'c-binondo', name: 'Barangay 289', population: 8195, lat: 14.6010, lng: 120.9733 },
  // San Nicolas
  { id: 'brgy-275', cityId: 'c-san-nicolas', name: 'Barangay 275', population: 15146, lat: 14.5994, lng: 120.9652 },
];

// ─── Flood Incidents — Real dataset (representative sample from spreadsheet) ─

export const FLOOD_INCIDENTS: FloodIncident[] = [
  // June 7, 2025 — Heavy Rainfall
  { id: 'fi-001', barangayId: 'brgy-670', date: '2025-06-07', time: '06:59', street: 'Padre Faura Taft South Bound', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-002', barangayId: 'brgy-660a', date: '2025-06-07', time: '15:02', street: 'UN Avenue LRT Taft', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-003', barangayId: 'brgy-675', date: '2025-06-07', time: '15:03', street: 'Pedro Gil LRT Taft', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-004', barangayId: 'brgy-676', date: '2025-06-07', time: '15:13', street: 'Taft Ave. cor Padre Faura', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-005', barangayId: 'brgy-659', date: '2025-06-07', time: '15:36', street: 'Quirino Avenue LRT Taft', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  // July 6-9, 2025 — Typhoon Bising
  { id: 'fi-006', barangayId: 'brgy-376', date: '2025-07-06', time: '21:08', street: 'Aurora Blvd cor P. Guevarra', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-007', barangayId: 'brgy-220', date: '2025-07-06', time: '21:25', street: 'Abad Santos cor Antipolo St', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-008', barangayId: 'brgy-676', date: '2025-07-08', time: '11:38', street: 'UN Station North Bound', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-009', barangayId: 'brgy-694', date: '2025-07-08', time: '11:46', street: 'Taft Pedro Gil Northbound', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-010', barangayId: 'brgy-676', date: '2025-07-09', time: '11:54', street: 'UN Taft', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  // July 18-19, 2025 — Typhoon Crising
  { id: 'fi-011', barangayId: 'brgy-676', date: '2025-07-18', time: '18:56', street: 'Padre Faura to Intersection', depthInches: 8, status: 'PATV', cause: 'Tropical Cyclone', priority: 'Low' },
  { id: 'fi-012', barangayId: 'brgy-694', date: '2025-07-18', time: '20:02', street: 'Pedro Gil cor Taft', depthInches: 8, status: 'PATV', cause: 'Tropical Cyclone', priority: 'Low' },
  { id: 'fi-013', barangayId: 'brgy-586', date: '2025-07-18', time: '20:56', street: 'Magsaysay Blvd', depthInches: 8, status: 'PATV', cause: 'Tropical Cyclone', priority: 'Low' },
  { id: 'fi-014', barangayId: 'brgy-372', date: '2025-07-18', time: '21:13', street: 'Blumentritt Rd North Cemetery', depthInches: 8, status: 'PATV', cause: 'Tropical Cyclone', priority: 'Low' },
  { id: 'fi-015', barangayId: 'brgy-693', date: '2025-07-19', time: '03:31', street: 'Malvar St. Taft', depthInches: 8, status: 'PATV', cause: 'Tropical Cyclone', priority: 'Low' },
  // July 21, 2025 — Crising continued (KNEE DEEP events)
  { id: 'fi-016', barangayId: 'brgy-666', date: '2025-07-21', time: '02:16', street: 'Gen. Luna going Taft Ave.', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-017', barangayId: 'brgy-676', date: '2025-07-21', time: '02:20', street: 'NBI Taft North & South Bound', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-018', barangayId: 'brgy-676', date: '2025-07-21', time: '02:21', street: 'Taft Ave. PGH', depthInches: 19, status: 'PATV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-019', barangayId: 'brgy-226', date: '2025-07-21', time: '03:02', street: 'Tayuman cor Abad Santos Ave.', depthInches: 10, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Medium' },
  { id: 'fi-020', barangayId: 'brgy-666', date: '2025-07-21', time: '03:03', street: 'Kalaw going Taft Ave.', depthInches: 10, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Medium' },
  { id: 'fi-021', barangayId: 'brgy-523', date: '2025-07-21', time: '06:20', street: 'España, Antipolo Street', depthInches: 19, status: 'PATV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-022', barangayId: 'brgy-694', date: '2025-07-21', time: '09:36', street: 'PGH Taft Ave.', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-023', barangayId: 'brgy-694', date: '2025-07-21', time: '09:40', street: 'Taft Ave & Pedro Gil', depthInches: 10, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Medium' },
  { id: 'fi-024', barangayId: 'brgy-649', date: '2025-07-21', time: '10:00', street: 'BASECO Port Area Manila', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-025', barangayId: 'brgy-598', date: '2025-07-21', time: '11:21', street: 'San Lorenzo Street', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-026', barangayId: 'brgy-649', date: '2025-07-21', time: '14:00', street: 'BLK 1 Dubai 649 BASECO', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-027', barangayId: 'brgy-649', date: '2025-07-21', time: '14:33', street: 'BLK 1 Dubai BASECO', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  // July 22-23, 2025 — Crising + Dante
  { id: 'fi-028', barangayId: 'brgy-676', date: '2025-07-22', time: '08:42', street: 'NBI Manila (Half Tire Deep)', depthInches: 13, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'Medium' },
  { id: 'fi-029', barangayId: 'brgy-676', date: '2025-07-22', time: '13:36', street: 'NBI Manila Southbound (Knee Deep)', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-030', barangayId: 'brgy-658', date: '2025-07-22', time: '02:56', street: 'Side of SM Manila', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-031', barangayId: 'brgy-313', date: '2025-07-23', time: '01:13', street: 'Arranque Market Sta Cruz Manila', depthInches: 45, status: 'NPATV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-032', barangayId: 'brgy-313', date: '2025-07-23', time: '05:40', street: 'Arranque Market (Knee Deep)', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  // July 24-25, 2025 — Emong
  { id: 'fi-033', barangayId: 'brgy-649', date: '2025-07-24', time: '00:57', street: 'Habitat Along Road BASECO', depthInches: 10, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Medium' },
  { id: 'fi-034', barangayId: 'brgy-676', date: '2025-07-24', time: '04:19', street: 'Taft, UN', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-035', barangayId: 'brgy-649', date: '2025-07-25', time: '00:19', street: 'BLK 15 BASECO (Knee Deep)', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  // Aug 22, 2025 — Typhoon Huaning
  { id: 'fi-036', barangayId: 'brgy-676', date: '2025-08-22', time: '01:29', street: 'Taft Ave Manila Science', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-037', barangayId: 'brgy-676', date: '2025-08-22', time: '01:38', street: 'Taft Ave cor Padre Faura (Knee Deep)', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-038', barangayId: 'brgy-674', date: '2025-08-22', time: '01:48', street: 'Taft Ave. cor Kalaw (Knee Deep)', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-039', barangayId: 'brgy-715', date: '2025-08-22', time: '02:12', street: 'Quirino Ave cor Leveriza (Knee Deep)', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-040', barangayId: 'brgy-659', date: '2025-08-22', time: '03:21', street: 'Antonio Villegas (Knee Deep)', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-041', barangayId: 'brgy-659', date: '2025-08-22', time: '05:48', street: 'Antonio Villegas Street (Tire Level Deep)', depthInches: 26, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-042', barangayId: 'brgy-676', date: '2025-08-22', time: '06:51', street: 'Padre Faura to Intersection (Knee Deep)', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  { id: 'fi-043', barangayId: 'brgy-660a', date: '2025-08-22', time: '07:09', street: 'Taft Adamson to Kalaw (Knee Deep)', depthInches: 19, status: 'NPLV', cause: 'Heavy Rainfall', priority: 'High' },
  // Sep 22, 2025 — Nando
  { id: 'fi-044', barangayId: 'brgy-694', date: '2025-09-22', time: '11:18', street: 'Escoda Corner Taft Ave.', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-045', barangayId: 'brgy-676', date: '2025-09-22', time: '11:29', street: 'Infront of NBI Taft', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-046', barangayId: 'brgy-220', date: '2025-09-22', time: '12:17', street: 'Abad Santos corner Antipolo St', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  // Sep 29, 2025 — Opong
  { id: 'fi-047', barangayId: 'brgy-693', date: '2025-09-29', time: '05:11', street: 'Taft ave. cor Gen. Malvar', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-048', barangayId: 'brgy-676', date: '2025-09-29', time: '05:18', street: 'Taft NBI', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  { id: 'fi-049', barangayId: 'brgy-376', date: '2025-09-29', time: '05:58', street: 'Aurora Blvd & Pampanga St', depthInches: 8, status: 'PATV', cause: 'Heavy Rainfall', priority: 'Low' },
  // Nov 9-10, 2025 — Typhoon Uwan
  { id: 'fi-050', barangayId: 'brgy-649', date: '2025-11-10', time: '00:43', street: 'Rd 2 BASECO Manila', depthInches: 8, status: 'PATV', cause: 'Tropical Cyclone', priority: 'Low' },
];

// ─── Recurrence Hotspots — Barangay 676 (most affected) ─────────────────────

export const RECURRENCE_HOTSPOTS: RecurrenceHotspot[] = [
  { street: 'NBI Taft / Padre Faura', eventCount: 28, segmentLow: 60, segmentMedium: 10, segmentHigh: 25, segmentVeryHigh: 5 },
  { street: 'Taft Ave. cor UN Avenue', eventCount: 18, segmentLow: 65, segmentMedium: 15, segmentHigh: 20, segmentVeryHigh: 0 },
  { street: 'Pedro Gil LRT Taft', eventCount: 22, segmentLow: 55, segmentMedium: 20, segmentHigh: 20, segmentVeryHigh: 5 },
  { street: 'Quirino Avenue LRT Taft', eventCount: 12, segmentLow: 70, segmentMedium: 15, segmentHigh: 10, segmentVeryHigh: 5 },
  { street: 'Kalaw Ave. cor Taft Ave.', eventCount: 8, segmentLow: 50, segmentMedium: 20, segmentHigh: 25, segmentVeryHigh: 5 },
  { street: 'Gen. Malvar cor Taft', eventCount: 10, segmentLow: 80, segmentMedium: 10, segmentHigh: 10, segmentVeryHigh: 0 },
];

// ─── Population Vulnerability — Streets (from dataset brgy columns) ──────────

export const STREET_VULNERABILITIES: StreetVulnerability[] = [
  { id: 'sv-001', barangayId: 'brgy-676', streetName: 'Taft Ave (NBI Section)', pwd: 427, elderly: 1820, children: 4195, pregnant: 248, lastUpdated: '2025-09-22' },
  { id: 'sv-002', barangayId: 'brgy-676', streetName: 'Padre Faura Street', pwd: 390, elderly: 1650, children: 3800, pregnant: 220, lastUpdated: '2025-09-22' },
  { id: 'sv-003', barangayId: 'brgy-676', streetName: 'UN Avenue Section', pwd: 350, elderly: 1500, children: 3500, pregnant: 200, lastUpdated: '2025-09-22' },
  { id: 'sv-004', barangayId: 'brgy-694', streetName: 'Pedro Gil LRT Station', pwd: 263, elderly: 1364, children: 2758, pregnant: 153, lastUpdated: '2025-09-22' },
  { id: 'sv-005', barangayId: 'brgy-694', streetName: 'PGH Taft Avenue', pwd: 240, elderly: 1200, children: 2500, pregnant: 140, lastUpdated: '2025-09-22' },
  { id: 'sv-006', barangayId: 'brgy-694', streetName: 'Escoda Street', pwd: 220, elderly: 1100, children: 2300, pregnant: 130, lastUpdated: '2025-09-22' },
  { id: 'sv-007', barangayId: 'brgy-649', streetName: 'BASECO Habitat Road', pwd: 197, elderly: 836, children: 1797, pregnant: 103, lastUpdated: '2025-09-22' },
  { id: 'sv-008', barangayId: 'brgy-649', streetName: 'BLK 15 BASECO', pwd: 180, elderly: 780, children: 1650, pregnant: 95, lastUpdated: '2025-09-22' },
  { id: 'sv-009', barangayId: 'brgy-649', streetName: 'Aplaya Street BASECO', pwd: 165, elderly: 720, children: 1500, pregnant: 88, lastUpdated: '2025-09-22' },
  { id: 'sv-010', barangayId: 'brgy-659', streetName: 'Antonio Villegas Street', pwd: 273, elderly: 1122, children: 2708, pregnant: 143, lastUpdated: '2025-09-22' },
  { id: 'sv-011', barangayId: 'brgy-659', streetName: 'Natividad Lopez Street', pwd: 250, elderly: 1050, children: 2500, pregnant: 130, lastUpdated: '2025-09-22' },
  { id: 'sv-012', barangayId: 'brgy-693', streetName: 'Taft cor Gen. Malvar', pwd: 190, elderly: 721, children: 1846, pregnant: 137, lastUpdated: '2025-09-22' },
];

// ─── Barangay Vulnerability Summary (from real dataset columns) ──────────────

export const BARANGAY_VULNERABILITIES: BarangayVulnerability[] = [
  { id: 'bv-676', cityId: 'c-ermita', name: 'Barangay 676', population: 14642, pwd: 427, elderly: 1820, children: 4195, pregnant: 248, lastUpdated: '2025-09-22' },
  { id: 'bv-694', cityId: 'c-ermita', name: 'Barangay 694', population: 11332, pwd: 263, elderly: 1364, children: 2758, pregnant: 153, lastUpdated: '2025-09-22' },
  { id: 'bv-695', cityId: 'c-ermita', name: 'Barangay 695', population: 17018, pwd: 428, elderly: 2027, children: 4928, pregnant: 259, lastUpdated: '2025-09-22' },
  { id: 'bv-659', cityId: 'c-ermita', name: 'Barangay 659', population: 12176, pwd: 273, elderly: 1122, children: 2708, pregnant: 143, lastUpdated: '2025-09-22' },
  { id: 'bv-659a', cityId: 'c-ermita', name: 'Barangay 659-A', population: 8259, pwd: 220, elderly: 874, children: 2449, pregnant: 142, lastUpdated: '2025-09-22' },
  { id: 'bv-693', cityId: 'c-malate', name: 'Barangay 693', population: 7644, pwd: 190, elderly: 721, children: 1846, pregnant: 137, lastUpdated: '2025-09-22' },
  { id: 'bv-649', cityId: 'c-portarea', name: 'Barangay 649', population: 7030, pwd: 197, elderly: 836, children: 1797, pregnant: 103, lastUpdated: '2025-09-22' },
  { id: 'bv-313', cityId: 'c-sta-cruz', name: 'Barangay 313', population: 10116, pwd: 273, elderly: 1244, children: 2690, pregnant: 173, lastUpdated: '2025-09-22' },
  { id: 'bv-376', cityId: 'c-sta-cruz', name: 'Barangay 376', population: 10069, pwd: 276, elderly: 1286, children: 2827, pregnant: 180, lastUpdated: '2025-09-22' },
  { id: 'bv-220', cityId: 'c-tondo', name: 'Barangay 220', population: 15101, pwd: 398, elderly: 1549, children: 3710, pregnant: 252, lastUpdated: '2025-09-22' },
  { id: 'bv-523', cityId: 'c-sampaloc', name: 'Barangay 523', population: 14368, pwd: 271, elderly: 1863, children: 3889, pregnant: 179, lastUpdated: '2025-09-22' },
  { id: 'bv-598', cityId: 'c-sta-mesa', name: 'Barangay 598', population: 13939, pwd: 398, elderly: 1811, children: 3737, pregnant: 181, lastUpdated: '2025-09-22' },
];

// ─── Street Registry (real dataset streets with scores) ──────────────────────

export const STREET_REGISTRY: StreetRegistryEntry[] = [
  { id: 'sr-001', barangayId: 'brgy-676', streetName: 'Taft Ave. cor Padre Faura', priorityScore: 11.28, vulnerabilityScore: 9.86, priority: 'High', floodCount: 28, lastUpdated: '2025-09-22', lat: 14.5800, lng: 120.9860 },
  { id: 'sr-002', barangayId: 'brgy-676', streetName: 'NBI Taft Avenue', priorityScore: 11.28, vulnerabilityScore: 9.86, priority: 'High', floodCount: 22, lastUpdated: '2025-09-22', lat: 14.5814, lng: 120.9853 },
  { id: 'sr-003', barangayId: 'brgy-676', streetName: 'UN cor Taft Avenue', priorityScore: 2.96, vulnerabilityScore: 9.86, priority: 'Medium', floodCount: 18, lastUpdated: '2025-09-22', lat: 14.5822, lng: 120.9849 },
  { id: 'sr-004', barangayId: 'brgy-694', streetName: 'Pedro Gil LRT Taft', priorityScore: 4.16, vulnerabilityScore: 8.83, priority: 'High', floodCount: 22, lastUpdated: '2025-09-22', lat: 14.5761, lng: 120.9882 },
  { id: 'sr-005', barangayId: 'brgy-694', streetName: 'PGH Taft Avenue', priorityScore: 2.65, vulnerabilityScore: 8.83, priority: 'Medium', floodCount: 12, lastUpdated: '2025-09-22', lat: 14.5773, lng: 120.9875 },
  { id: 'sr-006', barangayId: 'brgy-693', streetName: 'Taft Ave cor Gen. Malvar', priorityScore: 2.41, vulnerabilityScore: 8.03, priority: 'Low', floodCount: 10, lastUpdated: '2025-09-22', lat: 14.5748, lng: 120.9890 },
  { id: 'sr-007', barangayId: 'brgy-659', streetName: 'Antonio Villegas Street', priorityScore: 15.86, vulnerabilityScore: 7.47, priority: 'High', floodCount: 6, lastUpdated: '2025-09-22', lat: 14.5902, lng: 120.9822 },
  { id: 'sr-008', barangayId: 'brgy-649', streetName: 'BASECO Habitat Road', priorityScore: 4.25, vulnerabilityScore: 9.13, priority: 'High', floodCount: 14, lastUpdated: '2025-09-22', lat: 14.5914, lng: 120.9589 },
  { id: 'sr-009', barangayId: 'brgy-313', streetName: 'Arranque Market Alonzo cor Recto', priorityScore: 30.83, vulnerabilityScore: 9.44, priority: 'High', floodCount: 3, lastUpdated: '2025-09-22', lat: 14.6043, lng: 120.9794 },
  { id: 'sr-010', barangayId: 'brgy-674', streetName: 'Taft Ave cor Kalaw Ave', priorityScore: 10.91, vulnerabilityScore: 8.61, priority: 'High', floodCount: 8, lastUpdated: '2025-09-22', lat: 14.5836, lng: 120.9841 },
];

// ─── Priority List (derived from real dataset top-scored records) ─────────────

export const PRIORITY_LIST: PriorityItem[] = [
  { id: 'pl-001', streetName: 'Arranque Market', barangay: 'Barangay 313', priority: 'High', priorityScore: 30.83, vulnerabilityScore: 9.44, floodCount: 3, lat: 14.6043, lng: 120.9794 },
  { id: 'pl-002', streetName: 'Antonio Villegas Street', barangay: 'Barangay 659', priority: 'High', priorityScore: 15.86, vulnerabilityScore: 7.47, floodCount: 6, lat: 14.5902, lng: 120.9822 },
  { id: 'pl-003', streetName: 'NBI Taft (Padre Faura)', barangay: 'Barangay 676', priority: 'High', priorityScore: 11.28, vulnerabilityScore: 9.86, floodCount: 28, lat: 14.5814, lng: 120.9853 },
  { id: 'pl-004', streetName: 'San Lorenzo St.', barangay: 'Barangay 598', priority: 'High', priorityScore: 11.23, vulnerabilityScore: 9.69, floodCount: 2, lat: 14.6010, lng: 121.0202 },
  { id: 'pl-005', streetName: 'España Antipolo St.', barangay: 'Barangay 523', priority: 'High', priorityScore: 11.15, vulnerabilityScore: 9.41, floodCount: 1, lat: 14.6132, lng: 120.9964 },
  { id: 'pl-006', streetName: 'Cecilia Muñoz / Padre Burgos', barangay: 'Barangay 659-A', priority: 'High', priorityScore: 11.11, vulnerabilityScore: 9.29, floodCount: 6, lat: 14.5915, lng: 120.9817 },
  { id: 'pl-007', streetName: 'Gen. Luna going Taft Ave.', barangay: 'Barangay 666', priority: 'High', priorityScore: 10.99, vulnerabilityScore: 8.90, floodCount: 1, lat: 14.5829, lng: 120.9840 },
  { id: 'pl-008', streetName: 'Taft Ave cor Kalaw', barangay: 'Barangay 674', priority: 'High', priorityScore: 10.91, vulnerabilityScore: 8.61, floodCount: 8, lat: 14.5836, lng: 120.9841 },
  { id: 'pl-009', streetName: 'Quirino Ave cor Leveriza', barangay: 'Barangay 715', priority: 'High', priorityScore: 10.70, vulnerabilityScore: 7.92, floodCount: 1, lat: 14.5672, lng: 120.9891 },
  { id: 'pl-010', streetName: 'Pedro Gil cor Taft Ave', barangay: 'Barangay 694', priority: 'High', priorityScore: 4.16, vulnerabilityScore: 8.83, floodCount: 22, lat: 14.5761, lng: 120.9882 },
  { id: 'pl-011', streetName: 'BASECO Habitat Road', barangay: 'Barangay 649', priority: 'High', priorityScore: 4.25, vulnerabilityScore: 9.13, floodCount: 14, lat: 14.5914, lng: 120.9589 },
  { id: 'pl-012', streetName: 'Tayuman cor Abad Santos', barangay: 'Barangay 226', priority: 'High', priorityScore: 4.06, vulnerabilityScore: 8.48, floodCount: 3, lat: 14.6168, lng: 120.9772 },
];

// ─── Dashboard (real dataset-based metrics) ──────────────────────────────────

export const DASHBOARD_SUMMARY: DashboardSummary = {
  totalPopulation: 1877400,
  totalStreets: 3482,
  totalFloodRecords: 260,
  highPriorityAreas: 42,
  populationDistribution: [
    { label: 'General', count: 186, color: '#10B981' },
    { label: 'Senior', count: 28, color: '#F59E0B' },
    { label: 'Children', count: 38, color: '#EF4444' },
  ],
  topBarangays: [
    { name: 'Brgy. 676 (Ermita)', waterDepth: 42, level: 'High' },
    { name: 'Brgy. 694 (Ermita)', waterDepth: 28, level: 'High' },
    { name: 'Brgy. 659 (Ermita)', waterDepth: 12, level: 'High' },
    { name: 'Brgy. 649 (Port Area)', waterDepth: 14, level: 'High' },
    { name: 'Brgy. 693 (Malate)', waterDepth: 10, level: 'Medium' },
  ],
};
