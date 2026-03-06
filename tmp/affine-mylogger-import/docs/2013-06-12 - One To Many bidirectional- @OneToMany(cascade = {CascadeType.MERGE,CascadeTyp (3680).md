---
source: mylogger
mylogger_id: 3680
created: 2013-06-12T11:48:41+00:00
created_raw: 2013-06-12 11:48:41
completed_raw: 
tags:
  - jpa
---

One To Many bidirectional:::: @OneToMany(cascade = {CascadeType.MERGE,CascadeType.PERSIST}, fetch = FetchType.LAZY, mappedBy ="attribute") nprivate List<RiskAttributeMetadata> properties; n n@ManyToOne(fetch = FetchType.LAZY) n@JoinColumn(name="risk_attribute_id") nprivate RiskAttributeEntity attribute;
