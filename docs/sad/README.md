# Hitchpost: system analysis and design

The full lifecycle documentation for Hitchpost, from vision to maintenance after launch: 21 documents, baselined at version 1.0 for Phase 2. Every document marks what is **Built** (in the code now, with a path), **Phase N** (planned for that phase) or **Later**. Nothing planned is described as if it exists.

- **Read the bound edition:** [Hitchpost-System-Analysis-and-Design.pdf](Hitchpost-System-Analysis-and-Design.pdf) (cover, contents, page numbers, rendered diagrams).
- **Start here:** [00 Document control](00-document-control.md) has the document register, a reading guide by audience, the standards conformance matrix and the change-control process.
- **Rebuild the PDF** after editing any document: `pnpm docs:pdf`. The Markdown files are the source of truth.

| Stage                  | Documents                                                                                                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Control                | [00 Document control](00-document-control.md) · [20 Glossary](20-glossary.md)                                                                                                                                                                   |
| Vision and feasibility | [01 Vision and scope](01-vision-and-scope.md) · [02 Feasibility study](02-feasibility-study.md) · [03 Business case](03-business-case.md)                                                                                                       |
| Analysis               | [04 Stakeholders and personas](04-stakeholders-and-personas.md) · [05 Requirements](05-requirements.md) · [06 Use cases](06-use-cases.md) · [07 Process and behaviour models](07-process-and-behaviour-models.md)                               |
| Data                   | [08 Data design](08-data-design.md) · [09 Data dictionary](09-data-dictionary.md)                                                                                                                                                               |
| Design                 | [10 Architecture](10-architecture.md) · [11 Quality attributes](11-quality-attributes.md) · [12 Security and privacy](12-security-and-privacy.md) · [13 Interfaces](13-interfaces.md) · [14 User interface design](14-user-interface-design.md) |
| Verification           | [15 Test strategy](15-test-strategy.md)                                                                                                                                                                                                         |
| Delivery               | [16 Project plan](16-project-plan.md) · [17 Transition plan](17-transition-plan.md)                                                                                                                                                             |
| Run and maintain       | [18 Deployment and operations](18-deployment-and-operations.md) · [19 Maintenance and evolution](19-maintenance-and-evolution.md)                                                                                                               |
