export function isMentorRole(role?: string | null): boolean {
    return role === "MENTOR" || role === "BOTH";
}

export function getDefaultDashboardPath(role?: string | null): "/dashboard/mentor" | "/dashboard/mentee" {
    return isMentorRole(role) ? "/dashboard/mentor" : "/dashboard/mentee";
}
