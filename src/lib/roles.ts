export function isMentorRole(role?: string | null): boolean {
    return role === "MENTOR" || role === "MENTEE" || role === "BOTH";
}

export function getDefaultDashboardPath(_role?: string | null): "/dashboard/mentee" {
    void _role;
    return "/dashboard/mentee";
}

export function getRoleLabel(role?: string | null): string {
    if (role === "ADMIN") return "Admin";
    if (role === "SPONSOR") return "Sponsor";
    return "Member";
}
