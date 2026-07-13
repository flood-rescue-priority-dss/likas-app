// Pure name-based source of truth for Manila districts/areas/barangays.
// Deliberately contains NO ids -- your live DB already has its own ID scheme
// (e.g. "bgy-barangay-1", "c-tondo"), and it doesn't follow one simple,
// predictable slug rule (Tondo I -> "c-tondo", not "c-tondo-i"). Matching by
// exact `name` against the live districts/cities/barangays tables is the only
// reliable way to resolve IDs -- see reconcile_and_seed_geo.js.
//
// lat/lng are real polygon centroids computed from boundaries.json (shapely
// .centroid), not placeholders. Note: some already-seeded barangays in your
// DB store the polygon's first vertex as lat/lng instead of a true centroid
// (e.g. Barangay 1: DB has 14.602820398 / existing convention; centroid here
// may differ slightly). reconcile_and_seed_geo.js does NOT overwrite lat/lng
// for barangays that already exist, precisely to avoid fighting that
// convention -- it only fills lat/lng in for barangays being newly inserted.

const BARANGAY_RECORDS = [
  {
    "barangayName": "Barangay 287",
    "areaName": "Binondo",
    "districtName": "District 3",
    "lat": 14.599036,
    "lng": 120.972193
  },
  {
    "barangayName": "Barangay 288",
    "areaName": "Binondo",
    "districtName": "District 3",
    "lat": 14.601219,
    "lng": 120.972192
  },
  {
    "barangayName": "Barangay 289",
    "areaName": "Binondo",
    "districtName": "District 3",
    "lat": 14.599241,
    "lng": 120.973925
  },
  {
    "barangayName": "Barangay 290",
    "areaName": "Binondo",
    "districtName": "District 3",
    "lat": 14.599448,
    "lng": 120.975846
  },
  {
    "barangayName": "Barangay 291",
    "areaName": "Binondo",
    "districtName": "District 3",
    "lat": 14.597637,
    "lng": 120.975968
  },
  {
    "barangayName": "Barangay 292",
    "areaName": "Binondo",
    "districtName": "District 3",
    "lat": 14.603687,
    "lng": 120.973064
  },
  {
    "barangayName": "Barangay 293",
    "areaName": "Binondo",
    "districtName": "District 3",
    "lat": 14.604457,
    "lng": 120.97134
  },
  {
    "barangayName": "Barangay 294",
    "areaName": "Binondo",
    "districtName": "District 3",
    "lat": 14.60454,
    "lng": 120.974795
  },
  {
    "barangayName": "Barangay 295",
    "areaName": "Binondo",
    "districtName": "District 3",
    "lat": 14.602517,
    "lng": 120.974938
  },
  {
    "barangayName": "Barangay 296",
    "areaName": "Binondo",
    "districtName": "District 3",
    "lat": 14.602526,
    "lng": 120.973993
  },
  {
    "barangayName": "Barangay 649",
    "areaName": "Port Area",
    "districtName": "District 5",
    "lat": 14.588564,
    "lng": 120.960756
  },
  {
    "barangayName": "Barangay 650",
    "areaName": "Port Area",
    "districtName": "District 5",
    "lat": 14.590408,
    "lng": 120.967991
  },
  {
    "barangayName": "Barangay 651",
    "areaName": "Port Area",
    "districtName": "District 5",
    "lat": 14.588375,
    "lng": 120.969939
  },
  {
    "barangayName": "Barangay 652",
    "areaName": "Port Area",
    "districtName": "District 5",
    "lat": 14.586724,
    "lng": 120.971298
  },
  {
    "barangayName": "Barangay 653",
    "areaName": "Port Area",
    "districtName": "District 5",
    "lat": 14.587824,
    "lng": 120.976209
  },
  {
    "barangayName": "Barangay 654",
    "areaName": "Intramuros",
    "districtName": "District 5",
    "lat": 14.593145,
    "lng": 120.97479
  },
  {
    "barangayName": "Barangay 655",
    "areaName": "Intramuros",
    "districtName": "District 5",
    "lat": 14.591356,
    "lng": 120.972561
  },
  {
    "barangayName": "Barangay 656",
    "areaName": "Intramuros",
    "districtName": "District 5",
    "lat": 14.594028,
    "lng": 120.971658
  },
  {
    "barangayName": "Barangay 657",
    "areaName": "Intramuros",
    "districtName": "District 5",
    "lat": 14.58771,
    "lng": 120.975429
  },
  {
    "barangayName": "Barangay 658",
    "areaName": "Intramuros",
    "districtName": "District 5",
    "lat": 14.589796,
    "lng": 120.974866
  },
  {
    "barangayName": "Barangay 659",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.589489,
    "lng": 120.981446
  },
  {
    "barangayName": "Barangay 659-A",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.592957,
    "lng": 120.981123
  },
  {
    "barangayName": "Barangay 660",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.587758,
    "lng": 120.982357
  },
  {
    "barangayName": "Barangay 660-A",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.585359,
    "lng": 120.983102
  },
  {
    "barangayName": "Barangay 661",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.588983,
    "lng": 120.985781
  },
  {
    "barangayName": "Barangay 587",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.601882,
    "lng": 121.011118
  },
  {
    "barangayName": "Barangay 663",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.590182,
    "lng": 120.984246
  },
  {
    "barangayName": "Barangay 663-A",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.591057,
    "lng": 120.985781
  },
  {
    "barangayName": "Barangay 664",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.586383,
    "lng": 120.98576
  },
  {
    "barangayName": "Barangay 587-A",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.602627,
    "lng": 121.012529
  },
  {
    "barangayName": "Barangay 666",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.58203,
    "lng": 120.979572
  },
  {
    "barangayName": "Barangay 667",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.579289,
    "lng": 120.97881
  },
  {
    "barangayName": "Barangay 668",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.576315,
    "lng": 120.980216
  },
  {
    "barangayName": "Barangay 669",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.578037,
    "lng": 120.983481
  },
  {
    "barangayName": "Barangay 670",
    "areaName": "Ermita",
    "districtName": "District 5",
    "lat": 14.581146,
    "lng": 120.981951
  },
  {
    "barangayName": "Barangay 588",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.601382,
    "lng": 121.013136
  },
  {
    "barangayName": "Barangay 589",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.599399,
    "lng": 121.013908
  },
  {
    "barangayName": "Barangay 590",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.598952,
    "lng": 121.01151
  },
  {
    "barangayName": "Barangay 591",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.599871,
    "lng": 121.011605
  },
  {
    "barangayName": "Barangay 592",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.601184,
    "lng": 121.009144
  },
  {
    "barangayName": "Barangay 593",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.602183,
    "lng": 121.007722
  },
  {
    "barangayName": "Barangay 594",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.603846,
    "lng": 121.014307
  },
  {
    "barangayName": "Barangay 595",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.603053,
    "lng": 121.015483
  },
  {
    "barangayName": "Barangay 596",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.60216,
    "lng": 121.014516
  },
  {
    "barangayName": "Barangay 597",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.601651,
    "lng": 121.015511
  },
  {
    "barangayName": "Barangay 598",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.600298,
    "lng": 121.017283
  },
  {
    "barangayName": "Barangay 599",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.600175,
    "lng": 121.014905
  },
  {
    "barangayName": "Barangay 600",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.5987,
    "lng": 121.017255
  },
  {
    "barangayName": "Barangay 601",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.598463,
    "lng": 121.018865
  },
  {
    "barangayName": "Barangay 602",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.596876,
    "lng": 121.021128
  },
  {
    "barangayName": "Barangay 603",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.597418,
    "lng": 121.014628
  },
  {
    "barangayName": "Barangay 604",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.594992,
    "lng": 121.019224
  },
  {
    "barangayName": "Barangay 688",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.576119,
    "lng": 120.99226
  },
  {
    "barangayName": "Barangay 689",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.575345,
    "lng": 120.99113
  },
  {
    "barangayName": "Barangay 690",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.575332,
    "lng": 120.989935
  },
  {
    "barangayName": "Barangay 691",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.574,
    "lng": 120.990732
  },
  {
    "barangayName": "Barangay 692",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.573205,
    "lng": 120.989867
  },
  {
    "barangayName": "Barangay 693",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.574771,
    "lng": 120.988968
  },
  {
    "barangayName": "Barangay 694",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.576639,
    "lng": 120.988233
  },
  {
    "barangayName": "Barangay 695",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.577534,
    "lng": 120.989941
  },
  {
    "barangayName": "Barangay 696",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.575135,
    "lng": 120.986943
  },
  {
    "barangayName": "Barangay 697",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.574408,
    "lng": 120.985553
  },
  {
    "barangayName": "Barangay 698",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.573699,
    "lng": 120.984212
  },
  {
    "barangayName": "Barangay 699",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.572757,
    "lng": 120.982397
  },
  {
    "barangayName": "Barangay 700",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.570463,
    "lng": 120.983802
  },
  {
    "barangayName": "Barangay 701",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.568272,
    "lng": 120.984565
  },
  {
    "barangayName": "Barangay 702",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.571303,
    "lng": 120.985918
  },
  {
    "barangayName": "Barangay 703",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.572301,
    "lng": 120.988091
  },
  {
    "barangayName": "Barangay 704",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.569209,
    "lng": 120.986523
  },
  {
    "barangayName": "Barangay 705",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.569841,
    "lng": 120.987188
  },
  {
    "barangayName": "Barangay 706",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.570691,
    "lng": 120.988361
  },
  {
    "barangayName": "Barangay 707",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.569581,
    "lng": 120.988974
  },
  {
    "barangayName": "Barangay 708",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.568494,
    "lng": 120.990333
  },
  {
    "barangayName": "Barangay 709",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.569562,
    "lng": 120.990583
  },
  {
    "barangayName": "Barangay 710",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.568811,
    "lng": 120.988737
  },
  {
    "barangayName": "Barangay 711",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.568068,
    "lng": 120.989251
  },
  {
    "barangayName": "Barangay 712",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.569439,
    "lng": 120.989722
  },
  {
    "barangayName": "Barangay 713",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.568564,
    "lng": 120.98974
  },
  {
    "barangayName": "Barangay 714",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.570279,
    "lng": 120.989392
  },
  {
    "barangayName": "Barangay 715",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.567496,
    "lng": 120.989434
  },
  {
    "barangayName": "Barangay 716",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.567885,
    "lng": 120.989944
  },
  {
    "barangayName": "Barangay 717",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.568144,
    "lng": 120.990043
  },
  {
    "barangayName": "Barangay 718",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.567047,
    "lng": 120.990106
  },
  {
    "barangayName": "Barangay 719",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.565163,
    "lng": 120.991433
  },
  {
    "barangayName": "Barangay 720",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.566713,
    "lng": 120.989198
  },
  {
    "barangayName": "Barangay 721",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.567767,
    "lng": 120.988096
  },
  {
    "barangayName": "Barangay 722",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.573441,
    "lng": 120.992234
  },
  {
    "barangayName": "Barangay 723",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.572616,
    "lng": 120.991252
  },
  {
    "barangayName": "Barangay 724",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.571045,
    "lng": 120.992494
  },
  {
    "barangayName": "Barangay 725",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.569741,
    "lng": 120.991383
  },
  {
    "barangayName": "Barangay 726",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.569029,
    "lng": 120.99347
  },
  {
    "barangayName": "Barangay 727",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.567343,
    "lng": 120.993785
  },
  {
    "barangayName": "Barangay 728",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.565764,
    "lng": 120.994583
  },
  {
    "barangayName": "Barangay 729",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.564205,
    "lng": 120.994354
  },
  {
    "barangayName": "Barangay 730",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.564653,
    "lng": 120.996032
  },
  {
    "barangayName": "Barangay 731",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.572072,
    "lng": 120.99477
  },
  {
    "barangayName": "Barangay 732",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.571379,
    "lng": 120.995663
  },
  {
    "barangayName": "Barangay 733",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.568917,
    "lng": 120.99528
  },
  {
    "barangayName": "Barangay 734",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.578068,
    "lng": 120.995218
  },
  {
    "barangayName": "Barangay 735",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.57661,
    "lng": 120.995567
  },
  {
    "barangayName": "Barangay 736",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.576491,
    "lng": 120.994483
  },
  {
    "barangayName": "Barangay 737",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.57564,
    "lng": 120.995859
  },
  {
    "barangayName": "Barangay 738",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.574519,
    "lng": 120.995997
  },
  {
    "barangayName": "Barangay 739",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.572826,
    "lng": 120.995938
  },
  {
    "barangayName": "Barangay 740",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.5741,
    "lng": 120.994435
  },
  {
    "barangayName": "Barangay 741",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.575484,
    "lng": 120.99452
  },
  {
    "barangayName": "Barangay 742",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.575202,
    "lng": 120.993663
  },
  {
    "barangayName": "Barangay 743",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.574157,
    "lng": 120.993059
  },
  {
    "barangayName": "Barangay 744",
    "areaName": "Malate",
    "districtName": "District 5",
    "lat": 14.571605,
    "lng": 120.993988
  },
  {
    "barangayName": "Barangay 605",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.596287,
    "lng": 121.017402
  },
  {
    "barangayName": "Barangay 606",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.595368,
    "lng": 121.02029
  },
  {
    "barangayName": "Barangay 607",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.594393,
    "lng": 121.022411
  },
  {
    "barangayName": "Barangay 608",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.592451,
    "lng": 121.020118
  },
  {
    "barangayName": "Barangay 609",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.592562,
    "lng": 121.018151
  },
  {
    "barangayName": "Barangay 610",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.594094,
    "lng": 121.015578
  },
  {
    "barangayName": "Barangay 611",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.596143,
    "lng": 121.013604
  },
  {
    "barangayName": "Barangay 612",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.59487,
    "lng": 121.018125
  },
  {
    "barangayName": "Barangay 613",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.594178,
    "lng": 121.017474
  },
  {
    "barangayName": "Barangay 614",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.594302,
    "lng": 121.016024
  },
  {
    "barangayName": "Barangay 615",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.596442,
    "lng": 121.014668
  },
  {
    "barangayName": "Barangay 616",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.595414,
    "lng": 121.015717
  },
  {
    "barangayName": "Barangay 617",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.59353,
    "lng": 121.01979
  },
  {
    "barangayName": "Barangay 618",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.592154,
    "lng": 121.02063
  },
  {
    "barangayName": "Barangay 619",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.592347,
    "lng": 121.013849
  },
  {
    "barangayName": "Barangay 620",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.590946,
    "lng": 121.017966
  },
  {
    "barangayName": "Barangay 621",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.597344,
    "lng": 121.011454
  },
  {
    "barangayName": "Barangay 622",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.591969,
    "lng": 121.016298
  },
  {
    "barangayName": "Barangay 623",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.590443,
    "lng": 121.016689
  },
  {
    "barangayName": "Barangay 624",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.591494,
    "lng": 121.016366
  },
  {
    "barangayName": "Barangay 625",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.590281,
    "lng": 121.014937
  },
  {
    "barangayName": "Barangay 626",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.601621,
    "lng": 121.002385
  },
  {
    "barangayName": "Barangay 627",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.601713,
    "lng": 121.004238
  },
  {
    "barangayName": "Barangay 628",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.600094,
    "lng": 121.002248
  },
  {
    "barangayName": "Barangay 629",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.59885,
    "lng": 121.003832
  },
  {
    "barangayName": "Barangay 630",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.599365,
    "lng": 121.007988
  },
  {
    "barangayName": "Barangay 631",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.601432,
    "lng": 121.000937
  },
  {
    "barangayName": "Barangay 632",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.601335,
    "lng": 121.000035
  },
  {
    "barangayName": "Barangay 633",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.601168,
    "lng": 120.999517
  },
  {
    "barangayName": "Barangay 634",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.600912,
    "lng": 120.997802
  },
  {
    "barangayName": "Barangay 635",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.598841,
    "lng": 120.998987
  },
  {
    "barangayName": "Barangay 636",
    "areaName": "Santa Mesa",
    "districtName": "District 6",
    "lat": 14.598249,
    "lng": 120.997409
  },
  {
    "barangayName": "Barangay 637",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.600074,
    "lng": 120.994724
  },
  {
    "barangayName": "Barangay 638",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.599811,
    "lng": 120.991244
  },
  {
    "barangayName": "Barangay 639",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.597613,
    "lng": 120.993252
  },
  {
    "barangayName": "Barangay 640",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.598742,
    "lng": 120.995114
  },
  {
    "barangayName": "Barangay 641",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.59839,
    "lng": 120.98956
  },
  {
    "barangayName": "Barangay 642",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.595622,
    "lng": 120.989626
  },
  {
    "barangayName": "Barangay 643",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.595503,
    "lng": 120.9918
  },
  {
    "barangayName": "Barangay 644",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.593212,
    "lng": 120.989618
  },
  {
    "barangayName": "Barangay 645",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.593341,
    "lng": 120.988364
  },
  {
    "barangayName": "Barangay 646",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.593404,
    "lng": 120.986339
  },
  {
    "barangayName": "Barangay 647",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.594117,
    "lng": 120.982854
  },
  {
    "barangayName": "Barangay 648",
    "areaName": "San Miguel",
    "districtName": "District 6",
    "lat": 14.594695,
    "lng": 120.984981
  },
  {
    "barangayName": "Barangay 662",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.589405,
    "lng": 120.99068
  },
  {
    "barangayName": "Barangay 664-A",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.587322,
    "lng": 120.988778
  },
  {
    "barangayName": "Barangay 671",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.582914,
    "lng": 120.99107
  },
  {
    "barangayName": "Barangay 672",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.584238,
    "lng": 120.990133
  },
  {
    "barangayName": "Barangay 673",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.580935,
    "lng": 120.990248
  },
  {
    "barangayName": "Barangay 674",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.583295,
    "lng": 120.987237
  },
  {
    "barangayName": "Barangay 675",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.578851,
    "lng": 120.988316
  },
  {
    "barangayName": "Barangay 676",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.58074,
    "lng": 120.985969
  },
  {
    "barangayName": "Barangay 677",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.584696,
    "lng": 120.991763
  },
  {
    "barangayName": "Barangay 678",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.583807,
    "lng": 120.99358
  },
  {
    "barangayName": "Barangay 679",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.580962,
    "lng": 120.992291
  },
  {
    "barangayName": "Barangay 680",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.581982,
    "lng": 120.994017
  },
  {
    "barangayName": "Barangay 681",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.580659,
    "lng": 120.994154
  },
  {
    "barangayName": "Barangay 682",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.581691,
    "lng": 120.996066
  },
  {
    "barangayName": "Barangay 683",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.578924,
    "lng": 120.99359
  },
  {
    "barangayName": "Barangay 684",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.578927,
    "lng": 120.992686
  },
  {
    "barangayName": "Barangay 685",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.579031,
    "lng": 120.99469
  },
  {
    "barangayName": "Barangay 686",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.577612,
    "lng": 120.992666
  },
  {
    "barangayName": "Barangay 306",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.59786,
    "lng": 120.980242
  },
  {
    "barangayName": "Barangay 307",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.599995,
    "lng": 120.980748
  },
  {
    "barangayName": "Barangay 308",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.602287,
    "lng": 120.981848
  },
  {
    "barangayName": "Barangay 309",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.602377,
    "lng": 120.980418
  },
  {
    "barangayName": "Barangay 383",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.597146,
    "lng": 120.983031
  },
  {
    "barangayName": "Barangay 384",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.596845,
    "lng": 120.981996
  },
  {
    "barangayName": "Barangay 385",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.596468,
    "lng": 120.985048
  },
  {
    "barangayName": "Barangay 386",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.595533,
    "lng": 120.987347
  },
  {
    "barangayName": "Barangay 387",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.597708,
    "lng": 120.985318
  },
  {
    "barangayName": "Barangay 388",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.598855,
    "lng": 120.986034
  },
  {
    "barangayName": "Barangay 389",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.598595,
    "lng": 120.987804
  },
  {
    "barangayName": "Barangay 390",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.600733,
    "lng": 120.986719
  },
  {
    "barangayName": "Barangay 391",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.601906,
    "lng": 120.983091
  },
  {
    "barangayName": "Barangay 392",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.601893,
    "lng": 120.984517
  },
  {
    "barangayName": "Barangay 393",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.599531,
    "lng": 120.983874
  },
  {
    "barangayName": "Barangay 394",
    "areaName": "Quiapo",
    "districtName": "District 3",
    "lat": 14.600256,
    "lng": 120.982663
  },
  {
    "barangayName": "Barangay 395",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603813,
    "lng": 120.984427
  },
  {
    "barangayName": "Barangay 396",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.604977,
    "lng": 120.986159
  },
  {
    "barangayName": "Barangay 397",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606609,
    "lng": 120.987565
  },
  {
    "barangayName": "Barangay 398",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.605768,
    "lng": 120.989164
  },
  {
    "barangayName": "Barangay 399",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.605099,
    "lng": 120.987811
  },
  {
    "barangayName": "Barangay 400",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.60403,
    "lng": 120.988017
  },
  {
    "barangayName": "Barangay 401",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.60435,
    "lng": 120.989438
  },
  {
    "barangayName": "Barangay 402",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.602668,
    "lng": 120.989453
  },
  {
    "barangayName": "Barangay 403",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.60244,
    "lng": 120.988454
  },
  {
    "barangayName": "Barangay 404",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.602587,
    "lng": 120.987149
  },
  {
    "barangayName": "Barangay 405",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.60528,
    "lng": 120.990759
  },
  {
    "barangayName": "Barangay 406",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606021,
    "lng": 120.991191
  },
  {
    "barangayName": "Barangay 407",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.604157,
    "lng": 120.991769
  },
  {
    "barangayName": "Barangay 408",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.604578,
    "lng": 120.992651
  },
  {
    "barangayName": "Barangay 409",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.602742,
    "lng": 120.994431
  },
  {
    "barangayName": "Barangay 410",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.601112,
    "lng": 120.994292
  },
  {
    "barangayName": "Barangay 411",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603593,
    "lng": 120.994207
  },
  {
    "barangayName": "Barangay 412",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.601423,
    "lng": 120.991997
  },
  {
    "barangayName": "Barangay 413",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.602305,
    "lng": 120.992364
  },
  {
    "barangayName": "Barangay 414",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.602948,
    "lng": 120.992326
  },
  {
    "barangayName": "Barangay 415",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603387,
    "lng": 120.991144
  },
  {
    "barangayName": "Barangay 416",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.601828,
    "lng": 120.990128
  },
  {
    "barangayName": "Barangay 417",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.604562,
    "lng": 120.996992
  },
  {
    "barangayName": "Barangay 418",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603002,
    "lng": 120.997698
  },
  {
    "barangayName": "Barangay 419",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603668,
    "lng": 120.995915
  },
  {
    "barangayName": "Barangay 420",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.602089,
    "lng": 120.996413
  },
  {
    "barangayName": "Barangay 421",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.604794,
    "lng": 121.000121
  },
  {
    "barangayName": "Barangay 422",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606046,
    "lng": 120.999338
  },
  {
    "barangayName": "Barangay 423",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.605137,
    "lng": 120.998455
  },
  {
    "barangayName": "Barangay 424",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603222,
    "lng": 120.998716
  },
  {
    "barangayName": "Barangay 425",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603173,
    "lng": 121.000518
  },
  {
    "barangayName": "Barangay 426",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.602776,
    "lng": 121.003579
  },
  {
    "barangayName": "Barangay 427",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603392,
    "lng": 121.00181
  },
  {
    "barangayName": "Barangay 428",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603386,
    "lng": 121.002742
  },
  {
    "barangayName": "Barangay 429",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.60735,
    "lng": 120.99307
  },
  {
    "barangayName": "Barangay 430",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606513,
    "lng": 120.991711
  },
  {
    "barangayName": "Barangay 431",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607021,
    "lng": 120.992256
  },
  {
    "barangayName": "Barangay 432",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606728,
    "lng": 120.99429
  },
  {
    "barangayName": "Barangay 433",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.604853,
    "lng": 120.993147
  },
  {
    "barangayName": "Barangay 434",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.605985,
    "lng": 120.993056
  },
  {
    "barangayName": "Barangay 435",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.60494,
    "lng": 120.994083
  },
  {
    "barangayName": "Barangay 436",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.605309,
    "lng": 120.996229
  },
  {
    "barangayName": "Barangay 437",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606394,
    "lng": 120.997603
  },
  {
    "barangayName": "Barangay 438",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607031,
    "lng": 120.996473
  },
  {
    "barangayName": "Barangay 439",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606431,
    "lng": 120.995995
  },
  {
    "barangayName": "Barangay 440",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608537,
    "lng": 120.995964
  },
  {
    "barangayName": "Barangay 441",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609551,
    "lng": 120.994935
  },
  {
    "barangayName": "Barangay 442",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.610094,
    "lng": 120.995522
  },
  {
    "barangayName": "Barangay 443",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609073,
    "lng": 120.99655
  },
  {
    "barangayName": "Barangay 444",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608048,
    "lng": 120.997545
  },
  {
    "barangayName": "Barangay 445",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607511,
    "lng": 120.996998
  },
  {
    "barangayName": "Barangay 446",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607197,
    "lng": 120.99856
  },
  {
    "barangayName": "Barangay 447",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609052,
    "lng": 120.994411
  },
  {
    "barangayName": "Barangay 448",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607019,
    "lng": 120.995288
  },
  {
    "barangayName": "Barangay 449",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.60851,
    "lng": 120.993816
  },
  {
    "barangayName": "Barangay 450",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.611772,
    "lng": 120.994069
  },
  {
    "barangayName": "Barangay 451",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.611357,
    "lng": 120.993626
  },
  {
    "barangayName": "Barangay 452",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.611253,
    "lng": 120.992462
  },
  {
    "barangayName": "Barangay 453",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.610193,
    "lng": 120.993526
  },
  {
    "barangayName": "Barangay 454",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.61053,
    "lng": 120.991675
  },
  {
    "barangayName": "Barangay 455",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609476,
    "lng": 120.992735
  },
  {
    "barangayName": "Barangay 456",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609413,
    "lng": 120.991552
  },
  {
    "barangayName": "Barangay 457",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607633,
    "lng": 120.9901
  },
  {
    "barangayName": "Barangay 458",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606648,
    "lng": 120.989846
  },
  {
    "barangayName": "Barangay 459",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607834,
    "lng": 120.988767
  },
  {
    "barangayName": "Barangay 460",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608529,
    "lng": 120.990306
  },
  {
    "barangayName": "Barangay 461",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608736,
    "lng": 120.99121
  },
  {
    "barangayName": "Barangay 462",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606039,
    "lng": 120.984706
  },
  {
    "barangayName": "Barangay 463",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607248,
    "lng": 120.983914
  },
  {
    "barangayName": "Barangay 464",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.605997,
    "lng": 120.983516
  },
  {
    "barangayName": "Barangay 465",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608224,
    "lng": 120.984934
  },
  {
    "barangayName": "Barangay 466",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609283,
    "lng": 120.98382
  },
  {
    "barangayName": "Barangay 467",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607733,
    "lng": 120.984427
  },
  {
    "barangayName": "Barangay 468",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606702,
    "lng": 120.985477
  },
  {
    "barangayName": "Barangay 469",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607197,
    "lng": 120.985974
  },
  {
    "barangayName": "Barangay 470",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.612697,
    "lng": 120.985498
  },
  {
    "barangayName": "Barangay 471",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.611435,
    "lng": 120.984232
  },
  {
    "barangayName": "Barangay 472",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.614279,
    "lng": 120.991269
  },
  {
    "barangayName": "Barangay 473",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.613233,
    "lng": 120.992325
  },
  {
    "barangayName": "Barangay 474",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.615169,
    "lng": 120.990112
  },
  {
    "barangayName": "Barangay 475",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.613212,
    "lng": 120.991245
  },
  {
    "barangayName": "Barangay 476",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.612728,
    "lng": 120.990728
  },
  {
    "barangayName": "Barangay 477",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.61428,
    "lng": 120.989168
  },
  {
    "barangayName": "Barangay 478",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.612282,
    "lng": 120.990029
  },
  {
    "barangayName": "Barangay 479",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.611352,
    "lng": 120.989428
  },
  {
    "barangayName": "Barangay 480",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.613546,
    "lng": 120.9884
  },
  {
    "barangayName": "Barangay 481",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.612897,
    "lng": 120.987724
  },
  {
    "barangayName": "Barangay 482",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.617378,
    "lng": 120.986357
  },
  {
    "barangayName": "Barangay 483",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.618177,
    "lng": 120.987067
  },
  {
    "barangayName": "Barangay 484",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.619098,
    "lng": 120.986242
  },
  {
    "barangayName": "Barangay 485",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.617174,
    "lng": 120.988072
  },
  {
    "barangayName": "Barangay 486",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.616389,
    "lng": 120.987261
  },
  {
    "barangayName": "Barangay 487",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.616175,
    "lng": 120.989086
  },
  {
    "barangayName": "Barangay 488",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.615399,
    "lng": 120.988275
  },
  {
    "barangayName": "Barangay 489",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.614556,
    "lng": 120.98739
  },
  {
    "barangayName": "Barangay 490",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.614113,
    "lng": 120.986439
  },
  {
    "barangayName": "Barangay 491",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.615793,
    "lng": 120.986456
  },
  {
    "barangayName": "Barangay 492",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.62378,
    "lng": 120.986994
  },
  {
    "barangayName": "Barangay 493",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.62476,
    "lng": 120.986321
  },
  {
    "barangayName": "Barangay 494",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.622028,
    "lng": 120.989079
  },
  {
    "barangayName": "Barangay 495",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.62294,
    "lng": 120.987994
  },
  {
    "barangayName": "Barangay 496",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.62144,
    "lng": 120.990569
  },
  {
    "barangayName": "Barangay 497",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.62174,
    "lng": 120.986488
  },
  {
    "barangayName": "Barangay 498",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.620543,
    "lng": 120.989591
  },
  {
    "barangayName": "Barangay 499",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.619019,
    "lng": 120.987963
  },
  {
    "barangayName": "Barangay 500",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.620391,
    "lng": 120.987308
  },
  {
    "barangayName": "Barangay 501",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.61981,
    "lng": 120.988816
  },
  {
    "barangayName": "Barangay 502",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.614739,
    "lng": 120.993936
  },
  {
    "barangayName": "Barangay 503",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.613947,
    "lng": 120.99309
  },
  {
    "barangayName": "Barangay 504",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.615778,
    "lng": 120.992882
  },
  {
    "barangayName": "Barangay 505",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.614992,
    "lng": 120.99203
  },
  {
    "barangayName": "Barangay 506",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.616802,
    "lng": 120.991843
  },
  {
    "barangayName": "Barangay 507",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.61601,
    "lng": 120.991
  },
  {
    "barangayName": "Barangay 508",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.617815,
    "lng": 120.990828
  },
  {
    "barangayName": "Barangay 509",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.617011,
    "lng": 120.989973
  },
  {
    "barangayName": "Barangay 510",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.618806,
    "lng": 120.989829
  },
  {
    "barangayName": "Barangay 511",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.618008,
    "lng": 120.988976
  },
  {
    "barangayName": "Barangay 512",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.6177,
    "lng": 120.9959
  },
  {
    "barangayName": "Barangay 513",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.616916,
    "lng": 120.995191
  },
  {
    "barangayName": "Barangay 514",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.61854,
    "lng": 120.991612
  },
  {
    "barangayName": "Barangay 515",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.619366,
    "lng": 120.993253
  },
  {
    "barangayName": "Barangay 516",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.620743,
    "lng": 120.991926
  },
  {
    "barangayName": "Barangay 517",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.615583,
    "lng": 120.994843
  },
  {
    "barangayName": "Barangay 518",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.61977,
    "lng": 120.990857
  },
  {
    "barangayName": "Barangay 519",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.616516,
    "lng": 120.993655
  },
  {
    "barangayName": "Barangay 520",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.617874,
    "lng": 120.993007
  },
  {
    "barangayName": "Barangay 521",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.612759,
    "lng": 120.994042
  },
  {
    "barangayName": "Barangay 522",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.61236,
    "lng": 120.995143
  },
  {
    "barangayName": "Barangay 523",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.613296,
    "lng": 120.995686
  },
  {
    "barangayName": "Barangay 524",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.613801,
    "lng": 120.996088
  },
  {
    "barangayName": "Barangay 525",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.613461,
    "lng": 120.997271
  },
  {
    "barangayName": "Barangay 526",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.61478,
    "lng": 120.996305
  },
  {
    "barangayName": "Barangay 527",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.614188,
    "lng": 120.998704
  },
  {
    "barangayName": "Barangay 528",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.615494,
    "lng": 120.997108
  },
  {
    "barangayName": "Barangay 529",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.614549,
    "lng": 120.99745
  },
  {
    "barangayName": "Barangay 530",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.616451,
    "lng": 120.998165
  },
  {
    "barangayName": "Barangay 531",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.615489,
    "lng": 120.999348
  },
  {
    "barangayName": "Barangay 532",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.613055,
    "lng": 120.998264
  },
  {
    "barangayName": "Barangay 533",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.613289,
    "lng": 120.999356
  },
  {
    "barangayName": "Barangay 534",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.612373,
    "lng": 120.999806
  },
  {
    "barangayName": "Barangay 535",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.612078,
    "lng": 120.998726
  },
  {
    "barangayName": "Barangay 536",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.613147,
    "lng": 121.000942
  },
  {
    "barangayName": "Barangay 537",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.614314,
    "lng": 121.000549
  },
  {
    "barangayName": "Barangay 538",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.614149,
    "lng": 121.001548
  },
  {
    "barangayName": "Barangay 539",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.611215,
    "lng": 121.000477
  },
  {
    "barangayName": "Barangay 540",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.612726,
    "lng": 121.001879
  },
  {
    "barangayName": "Barangay 541",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.612375,
    "lng": 121.00271
  },
  {
    "barangayName": "Barangay 542",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609721,
    "lng": 120.997274
  },
  {
    "barangayName": "Barangay 543",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.610749,
    "lng": 120.996246
  },
  {
    "barangayName": "Barangay 544",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609959,
    "lng": 120.996407
  },
  {
    "barangayName": "Barangay 545",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609456,
    "lng": 120.998806
  },
  {
    "barangayName": "Barangay 546",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608257,
    "lng": 120.999715
  },
  {
    "barangayName": "Barangay 547",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.611854,
    "lng": 120.997731
  },
  {
    "barangayName": "Barangay 548",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.61135,
    "lng": 120.996744
  },
  {
    "barangayName": "Barangay 549",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609951,
    "lng": 121.000098
  },
  {
    "barangayName": "Barangay 550",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608646,
    "lng": 120.998184
  },
  {
    "barangayName": "Barangay 551",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607757,
    "lng": 120.999258
  },
  {
    "barangayName": "Barangay 552",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609151,
    "lng": 120.999935
  },
  {
    "barangayName": "Barangay 553",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.610295,
    "lng": 120.998283
  },
  {
    "barangayName": "Barangay 554",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.610822,
    "lng": 120.997849
  },
  {
    "barangayName": "Barangay 555",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.611653,
    "lng": 121.004754
  },
  {
    "barangayName": "Barangay 556",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.61136,
    "lng": 121.004265
  },
  {
    "barangayName": "Barangay 557",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.611062,
    "lng": 121.004073
  },
  {
    "barangayName": "Barangay 558",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.610876,
    "lng": 121.003766
  },
  {
    "barangayName": "Barangay 559",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.610572,
    "lng": 121.003593
  },
  {
    "barangayName": "Barangay 560",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.610112,
    "lng": 121.006286
  },
  {
    "barangayName": "Barangay 561",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.610402,
    "lng": 121.003238
  },
  {
    "barangayName": "Barangay 562",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.610031,
    "lng": 121.003147
  },
  {
    "barangayName": "Barangay 563",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609682,
    "lng": 121.002728
  },
  {
    "barangayName": "Barangay 564",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609328,
    "lng": 121.002168
  },
  {
    "barangayName": "Barangay 565",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607963,
    "lng": 121.00389
  },
  {
    "barangayName": "Barangay 566",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608388,
    "lng": 121.004862
  },
  {
    "barangayName": "Barangay 567",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608151,
    "lng": 121.002575
  },
  {
    "barangayName": "Barangay 568",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.609187,
    "lng": 121.005484
  },
  {
    "barangayName": "Barangay 569",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.605508,
    "lng": 121.004793
  },
  {
    "barangayName": "Barangay 570",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603962,
    "lng": 121.003469
  },
  {
    "barangayName": "Barangay 571",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.605455,
    "lng": 121.002522
  },
  {
    "barangayName": "Barangay 572",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606463,
    "lng": 121.003395
  },
  {
    "barangayName": "Barangay 573",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.60728,
    "lng": 121.000651
  },
  {
    "barangayName": "Barangay 574",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606608,
    "lng": 121.001647
  },
  {
    "barangayName": "Barangay 575",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607406,
    "lng": 121.002298
  },
  {
    "barangayName": "Barangay 576",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.606246,
    "lng": 121.000553
  },
  {
    "barangayName": "Barangay 577",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608165,
    "lng": 121.0011
  },
  {
    "barangayName": "Barangay 578",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.604507,
    "lng": 121.006069
  },
  {
    "barangayName": "Barangay 579",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.603409,
    "lng": 121.006261
  },
  {
    "barangayName": "Barangay 580",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.604742,
    "lng": 121.004043
  },
  {
    "barangayName": "Barangay 581",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.60534,
    "lng": 121.007668
  },
  {
    "barangayName": "Barangay 582",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.608881,
    "lng": 121.008347
  },
  {
    "barangayName": "Barangay 583",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607889,
    "lng": 121.007611
  },
  {
    "barangayName": "Barangay 584",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.607302,
    "lng": 121.01023
  },
  {
    "barangayName": "Barangay 585",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.605425,
    "lng": 121.010381
  },
  {
    "barangayName": "Barangay 586",
    "areaName": "Sampaloc",
    "districtName": "District 4",
    "lat": 14.605302,
    "lng": 121.012307
  },
  {
    "barangayName": "Barangay 687",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.578114,
    "lng": 120.991209
  },
  {
    "barangayName": "Barangay 745",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.569313,
    "lng": 120.996648
  },
  {
    "barangayName": "Barangay 746",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.568427,
    "lng": 120.996816
  },
  {
    "barangayName": "Barangay 747",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.571367,
    "lng": 120.998604
  },
  {
    "barangayName": "Barangay 748",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.570315,
    "lng": 120.998272
  },
  {
    "barangayName": "Barangay 749",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.56996,
    "lng": 120.999502
  },
  {
    "barangayName": "Barangay 750",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.573136,
    "lng": 120.99739
  },
  {
    "barangayName": "Barangay 751",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.571096,
    "lng": 120.997139
  },
  {
    "barangayName": "Barangay 752",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.569355,
    "lng": 120.997974
  },
  {
    "barangayName": "Barangay 753",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.57067,
    "lng": 120.996478
  },
  {
    "barangayName": "Barangay 754",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.569986,
    "lng": 120.996119
  },
  {
    "barangayName": "Barangay 755",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.564836,
    "lng": 120.997357
  },
  {
    "barangayName": "Barangay 756",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.565715,
    "lng": 120.998398
  },
  {
    "barangayName": "Barangay 757",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.566353,
    "lng": 120.999212
  },
  {
    "barangayName": "Barangay 758",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.567181,
    "lng": 121.000288
  },
  {
    "barangayName": "Barangay 759",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.568503,
    "lng": 121.000125
  },
  {
    "barangayName": "Barangay 760",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.567831,
    "lng": 120.998836
  },
  {
    "barangayName": "Barangay 761",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.567223,
    "lng": 120.997638
  },
  {
    "barangayName": "Barangay 762",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.56664,
    "lng": 120.996508
  },
  {
    "barangayName": "Barangay 763",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.570379,
    "lng": 121.002709
  },
  {
    "barangayName": "Barangay 764",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.569215,
    "lng": 121.001621
  },
  {
    "barangayName": "Barangay 765",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.571345,
    "lng": 121.003647
  },
  {
    "barangayName": "Barangay 766",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.572138,
    "lng": 121.004508
  },
  {
    "barangayName": "Barangay 767",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.572818,
    "lng": 121.002738
  },
  {
    "barangayName": "Barangay 768",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.571517,
    "lng": 121.001478
  },
  {
    "barangayName": "Barangay 769",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.570553,
    "lng": 121.000585
  },
  {
    "barangayName": "Barangay 770",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.575287,
    "lng": 121.006393
  },
  {
    "barangayName": "Barangay 771",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.575179,
    "lng": 121.002668
  },
  {
    "barangayName": "Barangay 772",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.574688,
    "lng": 121.004596
  },
  {
    "barangayName": "Barangay 773",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.5754,
    "lng": 121.005084
  },
  {
    "barangayName": "Barangay 774",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.577054,
    "lng": 121.004541
  },
  {
    "barangayName": "Barangay 775",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.573469,
    "lng": 121.004591
  },
  {
    "barangayName": "Barangay 776",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.576725,
    "lng": 121.006983
  },
  {
    "barangayName": "Barangay 777",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.577968,
    "lng": 121.005196
  },
  {
    "barangayName": "Barangay 778",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.575322,
    "lng": 121.008078
  },
  {
    "barangayName": "Barangay 779",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.5766,
    "lng": 121.006002
  },
  {
    "barangayName": "Barangay 780",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.578464,
    "lng": 121.00732
  },
  {
    "barangayName": "Barangay 781",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.579221,
    "lng": 121.006208
  },
  {
    "barangayName": "Barangay 782",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.577518,
    "lng": 121.008176
  },
  {
    "barangayName": "Barangay 783",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.576765,
    "lng": 121.008934
  },
  {
    "barangayName": "Barangay 784",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.577615,
    "lng": 121.001425
  },
  {
    "barangayName": "Barangay 785",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.576676,
    "lng": 121.001969
  },
  {
    "barangayName": "Barangay 786",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.576291,
    "lng": 121.001219
  },
  {
    "barangayName": "Barangay 787",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.57827,
    "lng": 121.001564
  },
  {
    "barangayName": "Barangay 788",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.579341,
    "lng": 121.001072
  },
  {
    "barangayName": "Barangay 789",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.579688,
    "lng": 121.002135
  },
  {
    "barangayName": "Barangay 790",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.578564,
    "lng": 121.002996
  },
  {
    "barangayName": "Barangay 791",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.578862,
    "lng": 121.003985
  },
  {
    "barangayName": "Barangay 792",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.580221,
    "lng": 121.004731
  },
  {
    "barangayName": "Barangay 793",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.580976,
    "lng": 121.004948
  },
  {
    "barangayName": "Barangay 794",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.577027,
    "lng": 120.999377
  },
  {
    "barangayName": "Barangay 795",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.577716,
    "lng": 121.000422
  },
  {
    "barangayName": "Barangay 796",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.576699,
    "lng": 120.998765
  },
  {
    "barangayName": "Barangay 797",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.577268,
    "lng": 121.000024
  },
  {
    "barangayName": "Barangay 798",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.575652,
    "lng": 120.998545
  },
  {
    "barangayName": "Barangay 799",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.575699,
    "lng": 120.997573
  },
  {
    "barangayName": "Barangay 800",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.57632,
    "lng": 120.996616
  },
  {
    "barangayName": "Barangay 801",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.575587,
    "lng": 121.000546
  },
  {
    "barangayName": "Barangay 802",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.574874,
    "lng": 120.999913
  },
  {
    "barangayName": "Barangay 803",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.573834,
    "lng": 120.998837
  },
  {
    "barangayName": "Barangay 804",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.57437,
    "lng": 121.001883
  },
  {
    "barangayName": "Barangay 805",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.573677,
    "lng": 121.001194
  },
  {
    "barangayName": "Barangay 806",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.57288,
    "lng": 121.000454
  },
  {
    "barangayName": "Barangay 268",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.604051,
    "lng": 120.969467
  },
  {
    "barangayName": "Barangay 269",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.603521,
    "lng": 120.968246
  },
  {
    "barangayName": "Barangay 270",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.601736,
    "lng": 120.966942
  },
  {
    "barangayName": "Barangay 271",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.601786,
    "lng": 120.968393
  },
  {
    "barangayName": "Barangay 272",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.599839,
    "lng": 120.966885
  },
  {
    "barangayName": "Barangay 273",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.599162,
    "lng": 120.96683
  },
  {
    "barangayName": "Barangay 274",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.600508,
    "lng": 120.965528
  },
  {
    "barangayName": "Barangay 275",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.597907,
    "lng": 120.953
  },
  {
    "barangayName": "Barangay 276",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.600672,
    "lng": 120.966209
  },
  {
    "barangayName": "Barangay 281",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.600011,
    "lng": 120.970025
  },
  {
    "barangayName": "Barangay 282",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.597469,
    "lng": 120.971524
  },
  {
    "barangayName": "Barangay 283",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.597503,
    "lng": 120.967243
  },
  {
    "barangayName": "Barangay 284",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.598118,
    "lng": 120.968261
  },
  {
    "barangayName": "Barangay 285",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.597657,
    "lng": 120.969457
  },
  {
    "barangayName": "Barangay 286",
    "areaName": "San Nicolas",
    "districtName": "District 3",
    "lat": 14.597277,
    "lng": 120.965976
  },
  {
    "barangayName": "Barangay 807",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.571879,
    "lng": 120.999567
  },
  {
    "barangayName": "Barangay 808",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.578724,
    "lng": 120.996986
  },
  {
    "barangayName": "Barangay 809",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.578403,
    "lng": 120.997876
  },
  {
    "barangayName": "Barangay 810",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.57731,
    "lng": 120.997408
  },
  {
    "barangayName": "Barangay 811",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.579315,
    "lng": 120.996871
  },
  {
    "barangayName": "Barangay 812",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.579316,
    "lng": 121.000013
  },
  {
    "barangayName": "Barangay 813",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.578992,
    "lng": 120.998757
  },
  {
    "barangayName": "Barangay 814",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.581205,
    "lng": 120.998419
  },
  {
    "barangayName": "Barangay 815",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.581755,
    "lng": 120.997856
  },
  {
    "barangayName": "Barangay 816",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.581954,
    "lng": 121.000238
  },
  {
    "barangayName": "Barangay 817",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.580604,
    "lng": 120.999402
  },
  {
    "barangayName": "Barangay 818",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.581251,
    "lng": 121.001264
  },
  {
    "barangayName": "Barangay 818-A",
    "areaName": "San Andres Bukid",
    "districtName": "District 5",
    "lat": 14.582866,
    "lng": 121.002097
  },
  {
    "barangayName": "Barangay 819",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.581828,
    "lng": 121.001854
  },
  {
    "barangayName": "Barangay 820",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.58276,
    "lng": 121.001135
  },
  {
    "barangayName": "Barangay 821",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.584197,
    "lng": 120.996274
  },
  {
    "barangayName": "Barangay 822",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.585066,
    "lng": 120.997175
  },
  {
    "barangayName": "Barangay 823",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.584244,
    "lng": 120.997969
  },
  {
    "barangayName": "Barangay 824",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.583221,
    "lng": 120.996778
  },
  {
    "barangayName": "Barangay 825",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.583145,
    "lng": 120.998086
  },
  {
    "barangayName": "Barangay 826",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.5862,
    "lng": 120.99621
  },
  {
    "barangayName": "Barangay 827",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.585853,
    "lng": 120.994119
  },
  {
    "barangayName": "Barangay 828",
    "areaName": "South Paco",
    "districtName": "District 5",
    "lat": 14.588152,
    "lng": 120.995786
  },
  {
    "barangayName": "Barangay 829",
    "areaName": "North Paco",
    "districtName": "District 6",
    "lat": 14.589422,
    "lng": 120.992967
  },
  {
    "barangayName": "Barangay 830",
    "areaName": "North Paco",
    "districtName": "District 6",
    "lat": 14.594584,
    "lng": 120.995271
  },
  {
    "barangayName": "Barangay 831",
    "areaName": "North Paco",
    "districtName": "District 6",
    "lat": 14.58925,
    "lng": 120.995303
  },
  {
    "barangayName": "Barangay 832",
    "areaName": "North Paco",
    "districtName": "District 6",
    "lat": 14.592606,
    "lng": 120.998444
  },
  {
    "barangayName": "Barangay 833",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.596219,
    "lng": 121.001736
  },
  {
    "barangayName": "Barangay 834",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.594373,
    "lng": 121.002463
  },
  {
    "barangayName": "Barangay 835",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.592815,
    "lng": 121.005124
  },
  {
    "barangayName": "Barangay 836",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.595032,
    "lng": 121.005954
  },
  {
    "barangayName": "Barangay 837",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.593006,
    "lng": 121.010159
  },
  {
    "barangayName": "Barangay 838",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.593686,
    "lng": 121.010829
  },
  {
    "barangayName": "Barangay 839",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.59152,
    "lng": 121.010113
  },
  {
    "barangayName": "Barangay 840",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.592479,
    "lng": 121.008274
  },
  {
    "barangayName": "Barangay 841",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.587412,
    "lng": 120.997123
  },
  {
    "barangayName": "Barangay 842",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.588051,
    "lng": 120.998281
  },
  {
    "barangayName": "Barangay 843",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.589422,
    "lng": 120.996805
  },
  {
    "barangayName": "Barangay 844",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.589397,
    "lng": 120.998315
  },
  {
    "barangayName": "Barangay 845",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.589689,
    "lng": 120.998883
  },
  {
    "barangayName": "Barangay 846",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.590204,
    "lng": 120.99962
  },
  {
    "barangayName": "Barangay 847",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.591746,
    "lng": 121.001134
  },
  {
    "barangayName": "Barangay 848",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.592917,
    "lng": 121.001049
  },
  {
    "barangayName": "Barangay 849",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.585503,
    "lng": 120.998221
  },
  {
    "barangayName": "Barangay 850",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.586393,
    "lng": 120.999128
  },
  {
    "barangayName": "Barangay 851",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.585053,
    "lng": 120.999807
  },
  {
    "barangayName": "Barangay 852",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.5846,
    "lng": 120.99939
  },
  {
    "barangayName": "Barangay 853",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.584109,
    "lng": 120.998967
  },
  {
    "barangayName": "Barangay 855",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.586484,
    "lng": 121.000314
  },
  {
    "barangayName": "Barangay 856",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.588873,
    "lng": 121.000082
  },
  {
    "barangayName": "Barangay 857",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.587081,
    "lng": 121.001332
  },
  {
    "barangayName": "Barangay 858",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.589506,
    "lng": 121.000821
  },
  {
    "barangayName": "Barangay 859",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.587969,
    "lng": 121.00175
  },
  {
    "barangayName": "Barangay 860",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.59043,
    "lng": 121.004633
  },
  {
    "barangayName": "Barangay 861",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.591589,
    "lng": 121.004467
  },
  {
    "barangayName": "Barangay 862",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.589281,
    "lng": 121.003041
  },
  {
    "barangayName": "Barangay 863",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.590487,
    "lng": 121.002173
  },
  {
    "barangayName": "Barangay 864",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.588121,
    "lng": 121.00222
  },
  {
    "barangayName": "Barangay 865",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.589322,
    "lng": 121.006062
  },
  {
    "barangayName": "Barangay 866",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.583725,
    "lng": 121.004512
  },
  {
    "barangayName": "Barangay 867",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.585168,
    "lng": 121.002983
  },
  {
    "barangayName": "Barangay 868",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.585289,
    "lng": 121.001719
  },
  {
    "barangayName": "Barangay 869",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.58187,
    "lng": 121.002852
  },
  {
    "barangayName": "Barangay 870",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.584996,
    "lng": 121.002536
  },
  {
    "barangayName": "Barangay 871",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.583952,
    "lng": 121.002055
  },
  {
    "barangayName": "Barangay 872",
    "areaName": "Pandacan",
    "districtName": "District 6",
    "lat": 14.584101,
    "lng": 121.000803
  },
  {
    "barangayName": "Barangay 873",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.581206,
    "lng": 121.00981
  },
  {
    "barangayName": "Barangay 874",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.578908,
    "lng": 121.009005
  },
  {
    "barangayName": "Barangay 875",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.580606,
    "lng": 121.007522
  },
  {
    "barangayName": "Barangay 876",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.58261,
    "lng": 121.008915
  },
  {
    "barangayName": "Barangay 877",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.581507,
    "lng": 121.006833
  },
  {
    "barangayName": "Barangay 878",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.579858,
    "lng": 121.01
  },
  {
    "barangayName": "Barangay 879",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.583357,
    "lng": 121.010116
  },
  {
    "barangayName": "Barangay 880",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.582313,
    "lng": 121.006491
  },
  {
    "barangayName": "Barangay 881",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.579048,
    "lng": 121.011727
  },
  {
    "barangayName": "Barangay 882",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.580225,
    "lng": 121.011386
  },
  {
    "barangayName": "Barangay 883",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.581007,
    "lng": 121.012872
  },
  {
    "barangayName": "Barangay 884",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.582188,
    "lng": 121.012833
  },
  {
    "barangayName": "Barangay 885",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.583548,
    "lng": 121.012361
  },
  {
    "barangayName": "Barangay 886",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.58422,
    "lng": 121.013917
  },
  {
    "barangayName": "Barangay 887",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.584072,
    "lng": 121.015364
  },
  {
    "barangayName": "Barangay 888",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.585878,
    "lng": 121.016325
  },
  {
    "barangayName": "Barangay 889",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.584994,
    "lng": 121.011421
  },
  {
    "barangayName": "Barangay 890",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.586283,
    "lng": 121.013552
  },
  {
    "barangayName": "Barangay 891",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.587283,
    "lng": 121.015754
  },
  {
    "barangayName": "Barangay 892",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.588362,
    "lng": 121.0188
  },
  {
    "barangayName": "Barangay 893",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.591297,
    "lng": 121.020867
  },
  {
    "barangayName": "Barangay 894",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.58903,
    "lng": 121.017561
  },
  {
    "barangayName": "Barangay 895",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.589753,
    "lng": 121.018619
  },
  {
    "barangayName": "Barangay 896",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.589114,
    "lng": 121.012021
  },
  {
    "barangayName": "Barangay 897",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.588659,
    "lng": 121.015396
  },
  {
    "barangayName": "Barangay 898",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.588984,
    "lng": 121.010174
  },
  {
    "barangayName": "Barangay 899",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.588383,
    "lng": 121.009274
  },
  {
    "barangayName": "Barangay 900",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.586209,
    "lng": 121.010127
  },
  {
    "barangayName": "Barangay 901",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.588171,
    "lng": 121.008548
  },
  {
    "barangayName": "Barangay 902",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.587913,
    "lng": 121.007995
  },
  {
    "barangayName": "Barangay 903",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.587848,
    "lng": 121.00693
  },
  {
    "barangayName": "Barangay 904",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.58668,
    "lng": 121.009046
  },
  {
    "barangayName": "Barangay 905",
    "areaName": "Santa Ana",
    "districtName": "District 6",
    "lat": 14.585534,
    "lng": 121.006468
  },
  {
    "barangayName": "Barangay 297",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.601234,
    "lng": 120.975372
  },
  {
    "barangayName": "Barangay 298",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.600696,
    "lng": 120.977055
  },
  {
    "barangayName": "Barangay 299",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.603677,
    "lng": 120.976347
  },
  {
    "barangayName": "Barangay 300",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.602156,
    "lng": 120.976011
  },
  {
    "barangayName": "Barangay 301",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.602732,
    "lng": 120.97737
  },
  {
    "barangayName": "Barangay 302",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.60196,
    "lng": 120.977016
  },
  {
    "barangayName": "Barangay 303",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.599836,
    "lng": 120.978834
  },
  {
    "barangayName": "Barangay 304",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.602818,
    "lng": 120.979088
  },
  {
    "barangayName": "Barangay 305",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.602899,
    "lng": 120.977911
  },
  {
    "barangayName": "Barangay 310",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.604768,
    "lng": 120.981477
  },
  {
    "barangayName": "Barangay 311",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.606889,
    "lng": 120.98209
  },
  {
    "barangayName": "Barangay 312",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.606527,
    "lng": 120.980332
  },
  {
    "barangayName": "Barangay 313",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.60476,
    "lng": 120.978013
  },
  {
    "barangayName": "Barangay 314",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.606008,
    "lng": 120.978073
  },
  {
    "barangayName": "Barangay 315",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.608631,
    "lng": 120.981459
  },
  {
    "barangayName": "Barangay 316",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.608686,
    "lng": 120.980195
  },
  {
    "barangayName": "Barangay 317",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.611319,
    "lng": 120.982577
  },
  {
    "barangayName": "Barangay 318",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.61017,
    "lng": 120.981981
  },
  {
    "barangayName": "Barangay 319",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.609217,
    "lng": 120.982875
  },
  {
    "barangayName": "Barangay 320",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.611422,
    "lng": 120.980771
  },
  {
    "barangayName": "Barangay 321",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.610264,
    "lng": 120.980258
  },
  {
    "barangayName": "Barangay 322",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.610222,
    "lng": 120.981121
  },
  {
    "barangayName": "Barangay 323",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.612357,
    "lng": 120.982613
  },
  {
    "barangayName": "Barangay 324",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.612436,
    "lng": 120.981198
  },
  {
    "barangayName": "Barangay 325",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.61248,
    "lng": 120.98034
  },
  {
    "barangayName": "Barangay 326",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.610323,
    "lng": 120.978416
  },
  {
    "barangayName": "Barangay 327",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.611955,
    "lng": 120.978206
  },
  {
    "barangayName": "Barangay 328",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.609235,
    "lng": 120.978309
  },
  {
    "barangayName": "Barangay 329",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.607714,
    "lng": 120.978428
  },
  {
    "barangayName": "Barangay 330",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.607583,
    "lng": 120.97756
  },
  {
    "barangayName": "Barangay 331",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.61498,
    "lng": 120.977019
  },
  {
    "barangayName": "Barangay 332",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.609201,
    "lng": 120.979298
  },
  {
    "barangayName": "Barangay 333",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.610309,
    "lng": 120.979353
  },
  {
    "barangayName": "Barangay 334",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.612025,
    "lng": 120.979372
  },
  {
    "barangayName": "Barangay 335",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.607669,
    "lng": 120.979238
  },
  {
    "barangayName": "Barangay 336",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.616047,
    "lng": 120.980897
  },
  {
    "barangayName": "Barangay 337",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.614774,
    "lng": 120.980837
  },
  {
    "barangayName": "Barangay 338",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.614679,
    "lng": 120.982711
  },
  {
    "barangayName": "Barangay 339",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.613557,
    "lng": 120.980821
  },
  {
    "barangayName": "Barangay 340",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.613461,
    "lng": 120.982672
  },
  {
    "barangayName": "Barangay 341",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.616017,
    "lng": 120.98266
  },
  {
    "barangayName": "Barangay 342",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.613915,
    "lng": 120.984373
  },
  {
    "barangayName": "Barangay 343",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.615612,
    "lng": 120.985076
  },
  {
    "barangayName": "Barangay 344",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.617283,
    "lng": 120.981008
  },
  {
    "barangayName": "Barangay 345",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.619651,
    "lng": 120.980854
  },
  {
    "barangayName": "Barangay 346",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.618454,
    "lng": 120.980869
  },
  {
    "barangayName": "Barangay 347",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.620855,
    "lng": 120.980847
  },
  {
    "barangayName": "Barangay 348",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.621851,
    "lng": 120.980806
  },
  {
    "barangayName": "Barangay 349",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.62128,
    "lng": 120.982445
  },
  {
    "barangayName": "Barangay 350",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.618327,
    "lng": 120.982389
  },
  {
    "barangayName": "Barangay 351",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.619742,
    "lng": 120.985096
  },
  {
    "barangayName": "Barangay 352",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.617083,
    "lng": 120.984743
  },
  {
    "barangayName": "Barangay 353",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.617136,
    "lng": 120.978554
  },
  {
    "barangayName": "Barangay 354",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.61845,
    "lng": 120.97859
  },
  {
    "barangayName": "Barangay 355",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.618306,
    "lng": 120.976618
  },
  {
    "barangayName": "Barangay 356",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.62185,
    "lng": 120.978955
  },
  {
    "barangayName": "Barangay 357",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.620875,
    "lng": 120.979228
  },
  {
    "barangayName": "Barangay 358",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.619665,
    "lng": 120.979219
  },
  {
    "barangayName": "Barangay 359",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.621916,
    "lng": 120.977372
  },
  {
    "barangayName": "Barangay 360",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.620874,
    "lng": 120.977894
  },
  {
    "barangayName": "Barangay 361",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.619665,
    "lng": 120.977905
  },
  {
    "barangayName": "Barangay 362",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.620131,
    "lng": 120.976831
  },
  {
    "barangayName": "Barangay 363",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.623373,
    "lng": 120.980832
  },
  {
    "barangayName": "Barangay 364",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.622928,
    "lng": 120.982817
  },
  {
    "barangayName": "Barangay 365",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.622687,
    "lng": 120.981353
  },
  {
    "barangayName": "Barangay 366",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.624421,
    "lng": 120.980606
  },
  {
    "barangayName": "Barangay 367",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.624428,
    "lng": 120.982385
  },
  {
    "barangayName": "Barangay 368",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.621529,
    "lng": 120.985337
  },
  {
    "barangayName": "Barangay 369",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.622776,
    "lng": 120.984042
  },
  {
    "barangayName": "Barangay 370",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.624412,
    "lng": 120.983695
  },
  {
    "barangayName": "Barangay 371",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.623054,
    "lng": 120.985246
  },
  {
    "barangayName": "Barangay 372",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.624555,
    "lng": 120.985031
  },
  {
    "barangayName": "Barangay 373",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.629829,
    "lng": 120.979903
  },
  {
    "barangayName": "Barangay 374",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.630826,
    "lng": 120.979038
  },
  {
    "barangayName": "Barangay 375",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.628896,
    "lng": 120.98071
  },
  {
    "barangayName": "Barangay 376",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.631454,
    "lng": 120.985887
  },
  {
    "barangayName": "Barangay 377",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.62744,
    "lng": 120.982338
  },
  {
    "barangayName": "Barangay 378",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.62811,
    "lng": 120.981537
  },
  {
    "barangayName": "Barangay 379",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.625385,
    "lng": 120.983067
  },
  {
    "barangayName": "Barangay 380",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.625771,
    "lng": 120.982167
  },
  {
    "barangayName": "Barangay 381",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.625637,
    "lng": 120.980847
  },
  {
    "barangayName": "Barangay 382",
    "areaName": "Santa Cruz",
    "districtName": "District 3",
    "lat": 14.627055,
    "lng": 120.980615
  },
  {
    "barangayName": "Barangay 1",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.60383,
    "lng": 120.96564
  },
  {
    "barangayName": "Barangay 10",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.606057,
    "lng": 120.968645
  },
  {
    "barangayName": "Barangay 100",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.621977,
    "lng": 120.959201
  },
  {
    "barangayName": "Barangay 101",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.625039,
    "lng": 120.959079
  },
  {
    "barangayName": "Barangay 102",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.621817,
    "lng": 120.960587
  },
  {
    "barangayName": "Barangay 103",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.620469,
    "lng": 120.960721
  },
  {
    "barangayName": "Barangay 104",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.619169,
    "lng": 120.961364
  },
  {
    "barangayName": "Barangay 105",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.619809,
    "lng": 120.959115
  },
  {
    "barangayName": "Barangay 106",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.623637,
    "lng": 120.958897
  },
  {
    "barangayName": "Barangay 107",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.617781,
    "lng": 120.959954
  },
  {
    "barangayName": "Barangay 108",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.617737,
    "lng": 120.962226
  },
  {
    "barangayName": "Barangay 109",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.61628,
    "lng": 120.962814
  },
  {
    "barangayName": "Barangay 11",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.601398,
    "lng": 120.965215
  },
  {
    "barangayName": "Barangay 110",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.615803,
    "lng": 120.959451
  },
  {
    "barangayName": "Barangay 111",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.616116,
    "lng": 120.962195
  },
  {
    "barangayName": "Barangay 112",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.615996,
    "lng": 120.960949
  },
  {
    "barangayName": "Barangay 116",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614376,
    "lng": 120.961079
  },
  {
    "barangayName": "Barangay 117",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614698,
    "lng": 120.962786
  },
  {
    "barangayName": "Barangay 118",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.612269,
    "lng": 120.960172
  },
  {
    "barangayName": "Barangay 119",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.61293,
    "lng": 120.961757
  },
  {
    "barangayName": "Barangay 12",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.600283,
    "lng": 120.96432
  },
  {
    "barangayName": "Barangay 120",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.61109,
    "lng": 120.962329
  },
  {
    "barangayName": "Barangay 121",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.611873,
    "lng": 120.962216
  },
  {
    "barangayName": "Barangay 122",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614159,
    "lng": 120.962343
  },
  {
    "barangayName": "Barangay 123",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.610962,
    "lng": 120.96107
  },
  {
    "barangayName": "Barangay 124",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.628701,
    "lng": 120.960604
  },
  {
    "barangayName": "Barangay 125",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.632268,
    "lng": 120.963076
  },
  {
    "barangayName": "Barangay 126",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.632793,
    "lng": 120.961869
  },
  {
    "barangayName": "Barangay 127",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.63339,
    "lng": 120.962524
  },
  {
    "barangayName": "Barangay 129",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.62847,
    "lng": 120.960921
  },
  {
    "barangayName": "Barangay 13",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.602639,
    "lng": 120.964906
  },
  {
    "barangayName": "Barangay 130",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.627633,
    "lng": 120.961577
  },
  {
    "barangayName": "Barangay 131",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.629668,
    "lng": 120.963318
  },
  {
    "barangayName": "Barangay 132",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.627013,
    "lng": 120.964193
  },
  {
    "barangayName": "Barangay 133",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.625913,
    "lng": 120.96268
  },
  {
    "barangayName": "Barangay 134",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.628009,
    "lng": 120.963298
  },
  {
    "barangayName": "Barangay 135",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.632832,
    "lng": 120.966459
  },
  {
    "barangayName": "Barangay 136",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.630079,
    "lng": 120.9663
  },
  {
    "barangayName": "Barangay 137",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.628404,
    "lng": 120.965486
  },
  {
    "barangayName": "Barangay 138",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.631537,
    "lng": 120.963746
  },
  {
    "barangayName": "Barangay 139",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.629749,
    "lng": 120.965556
  },
  {
    "barangayName": "Barangay 14",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.601988,
    "lng": 120.965229
  },
  {
    "barangayName": "Barangay 140",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.629779,
    "lng": 120.964546
  },
  {
    "barangayName": "Barangay 141",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.630634,
    "lng": 120.965126
  },
  {
    "barangayName": "Barangay 142",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.632174,
    "lng": 120.964367
  },
  {
    "barangayName": "Barangay 143",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.63067,
    "lng": 120.967377
  },
  {
    "barangayName": "Barangay 144",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.629805,
    "lng": 120.967598
  },
  {
    "barangayName": "Barangay 145",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.631563,
    "lng": 120.966925
  },
  {
    "barangayName": "Barangay 146",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.632513,
    "lng": 120.965109
  },
  {
    "barangayName": "Barangay 15",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.602309,
    "lng": 120.964042
  },
  {
    "barangayName": "Barangay 16",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.601301,
    "lng": 120.964002
  },
  {
    "barangayName": "Barangay 17",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.601243,
    "lng": 120.96323
  },
  {
    "barangayName": "Barangay 18",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.599907,
    "lng": 120.96316
  },
  {
    "barangayName": "Barangay 19",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.601159,
    "lng": 120.962504
  },
  {
    "barangayName": "Barangay 2",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.604907,
    "lng": 120.965936
  },
  {
    "barangayName": "Barangay 20",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.604806,
    "lng": 120.95355
  },
  {
    "barangayName": "Barangay 25",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.603457,
    "lng": 120.964403
  },
  {
    "barangayName": "Barangay 26",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.604653,
    "lng": 120.964024
  },
  {
    "barangayName": "Barangay 28",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.60313,
    "lng": 120.96229
  },
  {
    "barangayName": "Barangay 29",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.602863,
    "lng": 120.961564
  },
  {
    "barangayName": "Barangay 3",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.605343,
    "lng": 120.966722
  },
  {
    "barangayName": "Barangay 30",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.603032,
    "lng": 120.959734
  },
  {
    "barangayName": "Barangay 31",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.60418,
    "lng": 120.962971
  },
  {
    "barangayName": "Barangay 32",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.603027,
    "lng": 120.963267
  },
  {
    "barangayName": "Barangay 33",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.605352,
    "lng": 120.962579
  },
  {
    "barangayName": "Barangay 34",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.604974,
    "lng": 120.961894
  },
  {
    "barangayName": "Barangay 35",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.605554,
    "lng": 120.963677
  },
  {
    "barangayName": "Barangay 36",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.606689,
    "lng": 120.962948
  },
  {
    "barangayName": "Barangay 37",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.605556,
    "lng": 120.961155
  },
  {
    "barangayName": "Barangay 38",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.604498,
    "lng": 120.961203
  },
  {
    "barangayName": "Barangay 39",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.605116,
    "lng": 120.959945
  },
  {
    "barangayName": "Barangay 4",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.606977,
    "lng": 120.965754
  },
  {
    "barangayName": "Barangay 41",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.607225,
    "lng": 120.961688
  },
  {
    "barangayName": "Barangay 42",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.607385,
    "lng": 120.962259
  },
  {
    "barangayName": "Barangay 43",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.607386,
    "lng": 120.960921
  },
  {
    "barangayName": "Barangay 44",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.607281,
    "lng": 120.96003
  },
  {
    "barangayName": "Barangay 45",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.607054,
    "lng": 120.963648
  },
  {
    "barangayName": "Barangay 46",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.608082,
    "lng": 120.962603
  },
  {
    "barangayName": "Barangay 47",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.608409,
    "lng": 120.963414
  },
  {
    "barangayName": "Barangay 48",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.607608,
    "lng": 120.969388
  },
  {
    "barangayName": "Barangay 49",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.606236,
    "lng": 120.969223
  },
  {
    "barangayName": "Barangay 5",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.607823,
    "lng": 120.965634
  },
  {
    "barangayName": "Barangay 50",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.612876,
    "lng": 120.970212
  },
  {
    "barangayName": "Barangay 51",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.610636,
    "lng": 120.969945
  },
  {
    "barangayName": "Barangay 52",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.6138,
    "lng": 120.969343
  },
  {
    "barangayName": "Barangay 53",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614702,
    "lng": 120.970538
  },
  {
    "barangayName": "Barangay 54",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.616206,
    "lng": 120.97079
  },
  {
    "barangayName": "Barangay 55",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.616173,
    "lng": 120.969422
  },
  {
    "barangayName": "Barangay 56",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.610291,
    "lng": 120.968533
  },
  {
    "barangayName": "Barangay 57",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.610266,
    "lng": 120.967046
  },
  {
    "barangayName": "Barangay 58",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.612288,
    "lng": 120.96851
  },
  {
    "barangayName": "Barangay 59",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.612628,
    "lng": 120.967759
  },
  {
    "barangayName": "Barangay 6",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.608731,
    "lng": 120.965499
  },
  {
    "barangayName": "Barangay 60",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614156,
    "lng": 120.968292
  },
  {
    "barangayName": "Barangay 61",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.615844,
    "lng": 120.968454
  },
  {
    "barangayName": "Barangay 62",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.610715,
    "lng": 120.965696
  },
  {
    "barangayName": "Barangay 63",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.611431,
    "lng": 120.966288
  },
  {
    "barangayName": "Barangay 64",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.609687,
    "lng": 120.965686
  },
  {
    "barangayName": "Barangay 65",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.612521,
    "lng": 120.96658
  },
  {
    "barangayName": "Barangay 66",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.612718,
    "lng": 120.963681
  },
  {
    "barangayName": "Barangay 67",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.613493,
    "lng": 120.963706
  },
  {
    "barangayName": "Barangay 68",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.612215,
    "lng": 120.963635
  },
  {
    "barangayName": "Barangay 69",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.609754,
    "lng": 120.963449
  },
  {
    "barangayName": "Barangay 7",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.606125,
    "lng": 120.967506
  },
  {
    "barangayName": "Barangay 70",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.611329,
    "lng": 120.963835
  },
  {
    "barangayName": "Barangay 71",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.610214,
    "lng": 120.964557
  },
  {
    "barangayName": "Barangay 72",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.609759,
    "lng": 120.961813
  },
  {
    "barangayName": "Barangay 73",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.609761,
    "lng": 120.962608
  },
  {
    "barangayName": "Barangay 74",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.612895,
    "lng": 120.964749
  },
  {
    "barangayName": "Barangay 75",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.612621,
    "lng": 120.965572
  },
  {
    "barangayName": "Barangay 76",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614089,
    "lng": 120.965751
  },
  {
    "barangayName": "Barangay 77",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614982,
    "lng": 120.965937
  },
  {
    "barangayName": "Barangay 78",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.613653,
    "lng": 120.96689
  },
  {
    "barangayName": "Barangay 79",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614867,
    "lng": 120.963659
  },
  {
    "barangayName": "Barangay 8",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.608378,
    "lng": 120.968378
  },
  {
    "barangayName": "Barangay 80",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614198,
    "lng": 120.963699
  },
  {
    "barangayName": "Barangay 81",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614681,
    "lng": 120.964675
  },
  {
    "barangayName": "Barangay 82",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.615826,
    "lng": 120.964725
  },
  {
    "barangayName": "Barangay 83",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.617121,
    "lng": 120.964482
  },
  {
    "barangayName": "Barangay 84",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.616704,
    "lng": 120.964876
  },
  {
    "barangayName": "Barangay 85",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.6164,
    "lng": 120.96344
  },
  {
    "barangayName": "Barangay 86",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.616227,
    "lng": 120.96755
  },
  {
    "barangayName": "Barangay 87",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.616537,
    "lng": 120.966294
  },
  {
    "barangayName": "Barangay 88",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.614639,
    "lng": 120.967154
  },
  {
    "barangayName": "Barangay 89",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.615635,
    "lng": 120.966103
  },
  {
    "barangayName": "Barangay 9",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.607032,
    "lng": 120.968201
  },
  {
    "barangayName": "Barangay 90",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.615301,
    "lng": 120.967339
  },
  {
    "barangayName": "Barangay 91",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.617864,
    "lng": 120.966613
  },
  {
    "barangayName": "Barangay 92",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.618177,
    "lng": 120.964762
  },
  {
    "barangayName": "Barangay 93",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.619667,
    "lng": 120.964509
  },
  {
    "barangayName": "Barangay 94",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.622116,
    "lng": 120.963735
  },
  {
    "barangayName": "Barangay 95",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.618822,
    "lng": 120.963049
  },
  {
    "barangayName": "Barangay 96",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.621757,
    "lng": 120.962089
  },
  {
    "barangayName": "Barangay 97",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.620585,
    "lng": 120.962493
  },
  {
    "barangayName": "Barangay 98",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.626275,
    "lng": 120.960609
  },
  {
    "barangayName": "Barangay 99",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.624,
    "lng": 120.961729
  },
  {
    "barangayName": "Barangay 147",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.621803,
    "lng": 120.96612
  },
  {
    "barangayName": "Barangay 148",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.623307,
    "lng": 120.967259
  },
  {
    "barangayName": "Barangay 149",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.620447,
    "lng": 120.968553
  },
  {
    "barangayName": "Barangay 150",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.619084,
    "lng": 120.967479
  },
  {
    "barangayName": "Barangay 151",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.618384,
    "lng": 120.968333
  },
  {
    "barangayName": "Barangay 152",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.621487,
    "lng": 120.971605
  },
  {
    "barangayName": "Barangay 153",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.621562,
    "lng": 120.970328
  },
  {
    "barangayName": "Barangay 154",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.618243,
    "lng": 120.969573
  },
  {
    "barangayName": "Barangay 155",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.620544,
    "lng": 120.971568
  },
  {
    "barangayName": "Barangay 156",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.617598,
    "lng": 120.971105
  },
  {
    "barangayName": "Barangay 157",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.618369,
    "lng": 120.970568
  },
  {
    "barangayName": "Barangay 158",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.620176,
    "lng": 120.970018
  },
  {
    "barangayName": "Barangay 159",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.618882,
    "lng": 120.971438
  },
  {
    "barangayName": "Barangay 160",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.619709,
    "lng": 120.971443
  },
  {
    "barangayName": "Barangay 161",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.627348,
    "lng": 120.97194
  },
  {
    "barangayName": "Barangay 162",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.626256,
    "lng": 120.971694
  },
  {
    "barangayName": "Barangay 163",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.623098,
    "lng": 120.971341
  },
  {
    "barangayName": "Barangay 164",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.624576,
    "lng": 120.971542
  },
  {
    "barangayName": "Barangay 165",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.625385,
    "lng": 120.971746
  },
  {
    "barangayName": "Barangay 166",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.625172,
    "lng": 120.969572
  },
  {
    "barangayName": "Barangay 167",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.623916,
    "lng": 120.969356
  },
  {
    "barangayName": "Barangay 168",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.625316,
    "lng": 120.967797
  },
  {
    "barangayName": "Barangay 169",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.624106,
    "lng": 120.967548
  },
  {
    "barangayName": "Barangay 170",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.626053,
    "lng": 120.966728
  },
  {
    "barangayName": "Barangay 171",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.624973,
    "lng": 120.96599
  },
  {
    "barangayName": "Barangay 172",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.626655,
    "lng": 120.965555
  },
  {
    "barangayName": "Barangay 173",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.627504,
    "lng": 120.969992
  },
  {
    "barangayName": "Barangay 174",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.626377,
    "lng": 120.969777
  },
  {
    "barangayName": "Barangay 175",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.628089,
    "lng": 120.968097
  },
  {
    "barangayName": "Barangay 176",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.627171,
    "lng": 120.967492
  },
  {
    "barangayName": "Barangay 177",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.633205,
    "lng": 120.968557
  },
  {
    "barangayName": "Barangay 178",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.633065,
    "lng": 120.971061
  },
  {
    "barangayName": "Barangay 179",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.628905,
    "lng": 120.970607
  },
  {
    "barangayName": "Barangay 180",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.629121,
    "lng": 120.969025
  },
  {
    "barangayName": "Barangay 181",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.630054,
    "lng": 120.970434
  },
  {
    "barangayName": "Barangay 182",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.631441,
    "lng": 120.968516
  },
  {
    "barangayName": "Barangay 183",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.631147,
    "lng": 120.970482
  },
  {
    "barangayName": "Barangay 184",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.633267,
    "lng": 120.972476
  },
  {
    "barangayName": "Barangay 185",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.628731,
    "lng": 120.97205
  },
  {
    "barangayName": "Barangay 186",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.630864,
    "lng": 120.972168
  },
  {
    "barangayName": "Barangay 187",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.634971,
    "lng": 120.978063
  },
  {
    "barangayName": "Barangay 188",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.635083,
    "lng": 120.976962
  },
  {
    "barangayName": "Barangay 189",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.636088,
    "lng": 120.977662
  },
  {
    "barangayName": "Barangay 190",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.63686,
    "lng": 120.976631
  },
  {
    "barangayName": "Barangay 191",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.63683,
    "lng": 120.978111
  },
  {
    "barangayName": "Barangay 192",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.637765,
    "lng": 120.976924
  },
  {
    "barangayName": "Barangay 193",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.633755,
    "lng": 120.976632
  },
  {
    "barangayName": "Barangay 194",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.634356,
    "lng": 120.975775
  },
  {
    "barangayName": "Barangay 195",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.633728,
    "lng": 120.975831
  },
  {
    "barangayName": "Barangay 196",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.633392,
    "lng": 120.981474
  },
  {
    "barangayName": "Barangay 197",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.633373,
    "lng": 120.977493
  },
  {
    "barangayName": "Barangay 198",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.630564,
    "lng": 120.973609
  },
  {
    "barangayName": "Barangay 199",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.633252,
    "lng": 120.974164
  },
  {
    "barangayName": "Barangay 200",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.633082,
    "lng": 120.973383
  },
  {
    "barangayName": "Barangay 201",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.63093,
    "lng": 120.97575
  },
  {
    "barangayName": "Barangay 202",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.632724,
    "lng": 120.975575
  },
  {
    "barangayName": "Barangay 202-A",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.63225,
    "lng": 120.977087
  },
  {
    "barangayName": "Barangay 203",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.628577,
    "lng": 120.973822
  },
  {
    "barangayName": "Barangay 204",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.626952,
    "lng": 120.973786
  },
  {
    "barangayName": "Barangay 205",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.629413,
    "lng": 120.975445
  },
  {
    "barangayName": "Barangay 206",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.629153,
    "lng": 120.977462
  },
  {
    "barangayName": "Barangay 207",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.627641,
    "lng": 120.975366
  },
  {
    "barangayName": "Barangay 208",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.628007,
    "lng": 120.977908
  },
  {
    "barangayName": "Barangay 209",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.624182,
    "lng": 120.978685
  },
  {
    "barangayName": "Barangay 210",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.626196,
    "lng": 120.979357
  },
  {
    "barangayName": "Barangay 211",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.626102,
    "lng": 120.978227
  },
  {
    "barangayName": "Barangay 212",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.625796,
    "lng": 120.976584
  },
  {
    "barangayName": "Barangay 213",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.624419,
    "lng": 120.974031
  },
  {
    "barangayName": "Barangay 214",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.625599,
    "lng": 120.973304
  },
  {
    "barangayName": "Barangay 215",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.625768,
    "lng": 120.97511
  },
  {
    "barangayName": "Barangay 216",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.623983,
    "lng": 120.975141
  },
  {
    "barangayName": "Barangay 217",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.623333,
    "lng": 120.973381
  },
  {
    "barangayName": "Barangay 218",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.622205,
    "lng": 120.97329
  },
  {
    "barangayName": "Barangay 219",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.623811,
    "lng": 120.976036
  },
  {
    "barangayName": "Barangay 220",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.623549,
    "lng": 120.977505
  },
  {
    "barangayName": "Barangay 221",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.620014,
    "lng": 120.972853
  },
  {
    "barangayName": "Barangay 222",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.618727,
    "lng": 120.973227
  },
  {
    "barangayName": "Barangay 223",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.61974,
    "lng": 120.975685
  },
  {
    "barangayName": "Barangay 224",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.621402,
    "lng": 120.975919
  },
  {
    "barangayName": "Barangay 225",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.61764,
    "lng": 120.975777
  },
  {
    "barangayName": "Barangay 226",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.616935,
    "lng": 120.97664
  },
  {
    "barangayName": "Barangay 227",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.621464,
    "lng": 120.974586
  },
  {
    "barangayName": "Barangay 228",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.621311,
    "lng": 120.97337
  },
  {
    "barangayName": "Barangay 229",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.617694,
    "lng": 120.974502
  },
  {
    "barangayName": "Barangay 230",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.617791,
    "lng": 120.973821
  },
  {
    "barangayName": "Barangay 231",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.619868,
    "lng": 120.974193
  },
  {
    "barangayName": "Barangay 232",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.618802,
    "lng": 120.972297
  },
  {
    "barangayName": "Barangay 233",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.617435,
    "lng": 120.972549
  },
  {
    "barangayName": "Barangay 234",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.616083,
    "lng": 120.973664
  },
  {
    "barangayName": "Barangay 235",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.614915,
    "lng": 120.974167
  },
  {
    "barangayName": "Barangay 236",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.615464,
    "lng": 120.973461
  },
  {
    "barangayName": "Barangay 237",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.61447,
    "lng": 120.973235
  },
  {
    "barangayName": "Barangay 238",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.608686,
    "lng": 120.973307
  },
  {
    "barangayName": "Barangay 239",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.613048,
    "lng": 120.973451
  },
  {
    "barangayName": "Barangay 240",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.607338,
    "lng": 120.97241
  },
  {
    "barangayName": "Barangay 241",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.612049,
    "lng": 120.972356
  },
  {
    "barangayName": "Barangay 242",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.611201,
    "lng": 120.972665
  },
  {
    "barangayName": "Barangay 243",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.608861,
    "lng": 120.972749
  },
  {
    "barangayName": "Barangay 244",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.61123,
    "lng": 120.973238
  },
  {
    "barangayName": "Barangay 245",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.608563,
    "lng": 120.971953
  },
  {
    "barangayName": "Barangay 246",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.611146,
    "lng": 120.973648
  },
  {
    "barangayName": "Barangay 247",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.607153,
    "lng": 120.971846
  },
  {
    "barangayName": "Barangay 248",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.609582,
    "lng": 120.972357
  },
  {
    "barangayName": "Barangay 249",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.615644,
    "lng": 120.975067
  },
  {
    "barangayName": "Barangay 250",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.615401,
    "lng": 120.976051
  },
  {
    "barangayName": "Barangay 251",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.61404,
    "lng": 120.975502
  },
  {
    "barangayName": "Barangay 252",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.614202,
    "lng": 120.974805
  },
  {
    "barangayName": "Barangay 253",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.612819,
    "lng": 120.974548
  },
  {
    "barangayName": "Barangay 254",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.611646,
    "lng": 120.97485
  },
  {
    "barangayName": "Barangay 255",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.613708,
    "lng": 120.976603
  },
  {
    "barangayName": "Barangay 256",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.617648,
    "lng": 120.975225
  },
  {
    "barangayName": "Barangay 257",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.611878,
    "lng": 120.976096
  },
  {
    "barangayName": "Barangay 258",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.613936,
    "lng": 120.976015
  },
  {
    "barangayName": "Barangay 259",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.607278,
    "lng": 120.973899
  },
  {
    "barangayName": "Barangay 260",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.60641,
    "lng": 120.975935
  },
  {
    "barangayName": "Barangay 261",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.609773,
    "lng": 120.977578
  },
  {
    "barangayName": "Barangay 262",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.609431,
    "lng": 120.975379
  },
  {
    "barangayName": "Barangay 263",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.608159,
    "lng": 120.976794
  },
  {
    "barangayName": "Barangay 264",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.61037,
    "lng": 120.976699
  },
  {
    "barangayName": "Barangay 265",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.611581,
    "lng": 120.97723
  },
  {
    "barangayName": "Barangay 266",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.607007,
    "lng": 120.975159
  },
  {
    "barangayName": "Barangay 267",
    "areaName": "Tondo II",
    "districtName": "District 2",
    "lat": 14.612564,
    "lng": 120.977078
  },
  {
    "barangayName": "Barangay 128",
    "areaName": "Tondo I",
    "districtName": "District 1",
    "lat": 14.6323,
    "lng": 120.9524
  }
];

module.exports = { BARANGAY_RECORDS };