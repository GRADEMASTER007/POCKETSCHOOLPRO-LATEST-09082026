# 23 - Admin System & School Operations

The Admin Portal (`src/components/dashboards/AdminDashboard.tsx`) provides school administrators with operational tools:

1. **Multi-Learner Seat Provisioning**:
   - Manages institutional school base passes (`school_25`, `school_100`, `school_300`, `school_1000`).
2. **Pooled Token Quota Management**:
   - Monitors pooled token consumption across classes and reallocates unused seats dynamically.
3. **Teacher Role Management & Permissions**:
   - Assigns subject lead permissions, class roster access, and grading keys.
4. **School-Wide Analytics**:
   - High-level audit logs tracking total AI requests, Vision OCR scans, and curriculum progress.
