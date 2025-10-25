export type Locale = "en" | "sw";

export const locales: Locale[] = ["en", "sw"];

export const messages: Record<Locale, Record<string, string>> = {
  en: {
    nav_home: "Home",
    nav_products: "Products",
    nav_dashboard: "Dashboard",
    nav_orders: "Orders",
    nav_payments: "Payments",
    nav_seller_tools: "Seller Tools",
    nav_add_product: "Add Product",
    nav_webhooks: "Webhooks",
    nav_login: "Log in",
    nav_register: "Create account",
    nav_logout: "Log out",
    nav_tagline: "Materials • Labour • Advisory",
    hero_badge: "LMGa construction solutions",
    hero_title:
      "Trusted partner for materials, labour, and facility operations across Tanzania",
    hero_copy:
      "We engineer reliable supply chains for developers and contractors. From structural steel to turnkey labour mobilisation, LMGa keeps complex projects moving with verified product, certified crews, and transparent reporting.",
    hero_primary_cta: "Start a project",
    hero_secondary_cta: "View supply success stories",
    hero_metrics_projects: "Projects serviced",
    hero_metrics_delivery: "On-time delivery",
    hero_metrics_support: "Support desk",
    services_heading: "End-to-end support from design coordination to facilities handover",
    services_badge: "Integrated service pillars",
    services_design_title: "Design & Engineering",
    services_design_desc:
      "Integrate structural, MEP, and architectural reviews with supply planning for seamless mobilisation.",
    services_procurement_title: "Procurement & Logistics",
    services_procurement_desc:
      "Dynamic stock visibility, batch testing, and GPS-tracked deliveries across Tanzania’s key economic zones.",
    services_workforce_title: "Workforce Mobilisation",
    services_workforce_desc:
      "Certified crews, safety compliance, and payroll handled by LMGa so project teams stay focused on delivery.",
    case_studies_badge: "Supply success stories",
    case_studies_heading: "Case studies proving our construction supply model",
    case_study1_title: "Dar CBD Medical Tower",
    case_study1_challenge:
      "Phased supply of 500 tons of high-strength steel into a congested downtown site.",
    case_study1_solution:
      "Deployed just-in-time (JIT) deliveries with coordinated night-time offloading and digital gate pass management.",
    case_study1_outcome: "Zero delays, all lifts completed within programme.",
    case_study2_title: "Northern Corridor Housing Estate",
    case_study2_challenge:
      "60,000 bags of cement and finishing materials needed within a 90-day build cycle.",
    case_study2_solution:
      "Hybrid sourcing from LMGa depots in Arusha and Mwanza with satellite storage and on-site QA technicians.",
    case_study2_outcome: "Saved the developer 12% on procurement and logistics costs.",
    catalogue_badge: "Materials supply desk",
    catalogue_title: "Certified building materials ready for rapid mobilisation",
    catalogue_copy:
      "LMGa Construction Solutions aggregates structural, finishing, and MEP supplies across Tanzania. View realtime stock, confirm specs, and send a quote request in one workflow.",
    catalogue_primary_cta: "Browse live catalogue",
    catalogue_secondary_cta: "Request a quote",
    catalogue_overview_badge: "Catalogue overview",
    catalogue_overview_heading: "Materials curated for turnkey project delivery",
    catalogue_overview_copy:
      "Filter by material, brand, or budget. Every listing includes tested specifications, stock insight, and a pathway to integrate labour crews when required.",
    catalogue_search_label: "Search inventory",
    catalogue_search_placeholder: "Search by product name, brand, or specification",
    catalogue_budget_label: "Budget range",
    catalogue_price_any: "Any budget",
    catalogue_price_under15: "≤ 15,000 TZS",
    catalogue_price_mid: "15,000 – 50,000 TZS",
    catalogue_price_premium: "≥ 50,000 TZS",
    catalogue_filters_all: "All materials",
    catalogue_empty:
      "No materials match your filters yet. Adjust the search criteria or request a custom sourcing brief via the “Request a Quote” button.",
    catalogue_stats_catalogue: "Catalogue",
    catalogue_stats_inventory: "Inventory",
    catalogue_stats_value: "Inventory value",
    catalogue_stats_avg_price: "Average unit price",
    capability_section_badge: "Materials & workforce divisions",
    capability_supply_title: "Materials Supply Catalogue",
    capability_supply_desc:
      "Filter by grade, specification, or brand. Download technical data sheets and see live stock indicators.",
    capability_supply_cta: "Explore catalogue",
    capability_workforce_title: "Labour Hire & Workforce Solutions",
    capability_workforce_desc:
      "Mobilise OSHA-certified welders, plumbers, supervisors, and finishing crews with insurance handled by LMGa.",
    capability_workforce_cta: "Request workforce brief",
    product_card_stock: "Units ready for mobilisation",
    product_card_brand: "Preferred brand",
    product_card_cta: "View product sheet",
    product_detail_overview_badge: "Specification overview",
    product_detail_choose_title: "Why builders choose this line",
    order_panel_heading: "Mobilise this material",
    order_panel_login_prompt:
      "Log in to fast-track ordering, or create an account to save delivery preferences.",
    order_panel_logged_in_prompt:
      "Orders will be placed under {phone}. Delivery sequencing and tracking will appear in your dashboard.",
    order_panel_quantity: "Quantity required",
    order_panel_delivery: "Delivery method",
    order_panel_delivery_pickup: "Pick-up from depot",
    order_panel_delivery_ship: "Coordinated delivery",
    order_panel_submit: "Create order & add this material",
    order_panel_payment: "Create mobile money request",
    order_panel_payment_webhook: "Trigger success webhook",
    landing_call_heading: "Ready to align your next build with dependable supply?",
    landing_call_copy:
      "Our procurement desk responds within the hour. Share your scope requests and we’ll coordinate materials, labour, and facilities support under one contract.",
    landing_call_primary: "Request a proposal",
    landing_call_secondary: "Call procurement desk",
    footer_tagline: "Engineered for reliability & transparency.",
    locale_toggle_label: "Switch language",
  },
  sw: {
    nav_home: "Nyumbani",
    nav_products: "Bidhaa",
    nav_dashboard: "Dashibodi",
    nav_orders: "Oda",
    nav_payments: "Malipo",
    nav_seller_tools: "Zana za Muuzaji",
    nav_add_product: "Ongeza Bidhaa",
    nav_webhooks: "Webhooks",
    nav_login: "Ingia",
    nav_register: "Fungua akaunti",
    nav_logout: "Toka",
    nav_tagline: "Vifaa • Wafanyakazi • Ushauri",
    hero_badge: "LMGa suluhu za ujenzi",
    hero_title:
      "Mshirika wa kuaminika wa vifaa, nguvu kazi, na uendeshaji wa miundombinu Tanzania nzima",
    hero_copy:
      "Tunapanga minyororo ya ugavi kwa wakandarasi na wastaafu. Kuanzia chuma cha muundo hadi nguvu kazi kamili, LMGa inahakikisha miradi inaendelea kwa bidhaa zilizothibitishwa, mafundi waliothibitishwa, na taarifa wazi.",
    hero_primary_cta: "Anza mradi",
    hero_secondary_cta: "Tazama mafanikio ya ugavi",
    hero_metrics_projects: "Miradi iliyohudumiwa",
    hero_metrics_delivery: "Uwasilishaji kwa wakati",
    hero_metrics_support: "Dawati la usaidizi",
    services_heading: "Msaada kamili kutoka uratibu wa usanifu hadi kukabidhi majengo",
    services_badge: "Nguzo za huduma zilizounganishwa",
    services_design_title: "Ubunifu na Uhandisi",
    services_design_desc:
      "Unganisha ukaguzi wa miundo, MEP na usanifu na upangaji wa ugavi kwa usambazaji usio na vikwazo.",
    services_procurement_title: "Ununuzi na Usafirishaji",
    services_procurement_desc:
      "Mwonekano wa hifadhi kwa wakati halisi, upimaji wa kundi, na usafirishaji unaofuatiliwa kwa GPS katika maeneo ya uchumi.",
    services_workforce_title: "Uwezeshaji wa Nguvu Kazi",
    services_workforce_desc:
      "Wafanyakazi walio na vyeti, ufuasi wa usalama, na malipo kushughulikiwa na LMGa ili timu za mradi zizingatie utekelezaji.",
    case_studies_badge: "Hadithi za mafanikio ya ugavi",
    case_studies_heading: "Ushahidi wa mtindo wetu wa ugavi wa ujenzi",
    case_study1_title: "Jengo la Matibabu Dar CBD",
    case_study1_challenge:
      "Uwasilishaji kwa awamu wa tani 500 za chuma cha nguvu ya juu kwenye eneo lenye msongamano katikati ya jiji.",
    case_study1_solution:
      "Usafirishaji wa JIT ulioratibiwa usiku pamoja na usimamizi wa vibali vya kuingia kupitia mfumo wa kidijitali.",
    case_study1_outcome: "Hakuna ucheleweshaji, kazi za kuinua zilikamilika kwa wakati.",
    case_study2_title: "Makazi ya Northern Corridor",
    case_study2_challenge:
      "Mabegi 60,000 ya saruji na vifaa vya kumalizia vilihitajika ndani ya siku 90 za ujenzi.",
    case_study2_solution:
      "Ugavi mseto kutoka maghala ya LMGa Arusha na Mwanza pamoja na hifadhi za satelaiti na wataalamu wa QA kwenye tovuti.",
    case_study2_outcome:
      "Mteja aliokoa 12% ya gharama za ununuzi na usafirishaji.",
    catalogue_badge: "Dawati la usambazaji wa vifaa",
    catalogue_title: "Vifaa vya ujenzi vilivyothibitishwa tayari kwa kusambazwa haraka",
    catalogue_copy:
      "LMGa Construction Solutions hukusanya vifaa vya miundo, kumalizia, na MEP kote Tanzania. Angalia hisa kwa wakati halisi, hakikisha vipimo, na tuma ombi la bei kwa hatua moja.",
    catalogue_primary_cta: "Vinjari orodha hai",
    catalogue_secondary_cta: "Omba nukuu",
    catalogue_overview_badge: "Muhtasari wa orodha",
    catalogue_overview_heading: "Vifaa vilivyochaguliwa kwa utoaji wa mradi wa turnkey",
    catalogue_overview_copy:
      "Chuja kwa aina ya nyenzo, chapa, au bajeti. Kila bidhaa ina vipimo vilivyothibitishwa, taarifa za hisa, na njia ya kuunganisha nguvu kazi inapohitajika.",
    catalogue_search_label: "Tafuta vifaa",
    catalogue_search_placeholder: "Tafuta kwa jina la bidhaa, chapa, au maelezo",
    catalogue_budget_label: "Kiwango cha bajeti",
    catalogue_price_any: "Bajeti yoyote",
    catalogue_price_under15: "≤ 15,000 TZS",
    catalogue_price_mid: "15,000 – 50,000 TZS",
    catalogue_price_premium: "≥ 50,000 TZS",
    catalogue_filters_all: "Vifaa vyote",
    catalogue_empty:
      "Hakuna vifaa vinavyolingana na vigezo vyako. Rekebisha vigezo au tuma ombi maalum kupitia kitufe cha “Omba Nukuu”.",
    catalogue_stats_catalogue: "Orodha",
    catalogue_stats_inventory: "Hifadhi",
    catalogue_stats_value: "Thamani ya hifadhi",
    catalogue_stats_avg_price: "Bei ya wastani kwa kitengo",
    capability_section_badge: "Kitengo cha vifaa na nguvu kazi",
    capability_supply_title: "Orodha ya Ugavi wa Vifaa",
    capability_supply_desc:
      "Chuja kwa kiwango, vipimo, au chapa. Pakua karatasi za data na uone viashiria vya hisa moja kwa moja.",
    capability_supply_cta: "Vinjarisha orodha",
    capability_workforce_title: "Ajira ya Wafanyakazi",
    capability_workforce_desc:
      "Panga mafundi wenye vyeti vya OSHA—welding, mabomba, usimamizi—na bima kushughulikiwa na LMGa.",
    capability_workforce_cta: "Omba taarifa ya nguvu kazi",
    product_card_stock: "Vitengo tayari kusambazwa",
    product_card_brand: "Chapa inayopendekezwa",
    product_card_cta: "Tazama maelezo ya bidhaa",
    product_detail_overview_badge: "Muhtasari wa vipimo",
    product_detail_choose_title: "Kwa nini wakandarasi wanapendelea bidhaa hii",
    order_panel_heading: "Agiza kifaa hiki",
    order_panel_login_prompt:
      "Ingia ili kuharakisha mchakato wa kuagiza, au fungua akaunti kuhifadhi mapendeleo ya usafirishaji.",
    order_panel_logged_in_prompt:
      "Oda zitawekwa kwa nambari {phone}. Ratiba za usafirishaji na ufuatiliaji zitaonekana kwenye dashibodi yako.",
    order_panel_quantity: "Kiasi kinachohitajika",
    order_panel_delivery: "Njia ya usafirishaji",
    order_panel_delivery_pickup: "Chukua kwenye ghala",
    order_panel_delivery_ship: "Uwasilishaji unaoratibiwa",
    order_panel_submit: "Unda oda na ongeza bidhaa hii",
    order_panel_payment: "Unda ombi la malipo ya simu",
    order_panel_payment_webhook: "Thibitisha malipo",
    landing_call_heading: "Uko tayari kuoanisha mradi wako na ugavi wa kuaminika?",
    landing_call_copy:
      "Dawati letu la ununuzi hujibu ndani ya saa moja. Shiriki maombi yako na tutaratibu vifaa, nguvu kazi, na uendeshaji chini ya kandarasi moja.",
    landing_call_primary: "Omba pendekezo",
    landing_call_secondary: "Piga dawati la ununuzi",
    footer_tagline: "Imetengenezwa kwa uaminifu na uwazi.",
    locale_toggle_label: "Badili lugha",
  },
};
