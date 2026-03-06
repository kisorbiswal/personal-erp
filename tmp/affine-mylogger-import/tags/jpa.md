# tag: jpa

total: 1

## #3680
- added: 2013-06-12 11:48:41

One To Many bidirectional:::: @OneToMany(cascade = {CascadeType.MERGE,CascadeType.PERSIST}, fetch = FetchType.LAZY, mappedBy ="attribute") \nprivate List<RiskAttributeMetadata> properties; \n \n@ManyToOne(fetch = FetchType.LAZY) \n@JoinColumn(name="risk_attribute_id") \nprivate RiskAttributeEntity attribute;

---
