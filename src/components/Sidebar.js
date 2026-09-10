'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard, Users, FileText, Heart, ArrowRightLeft,
  CalendarCheck, Building2, RefreshCw, LogOut, Mic, BookOpen,
  ClipboardList, Pill, Home, ShieldCheck, BarChart3, X
} from 'lucide-react';

const NAV_CONFIG = {
  asha: {
    label: 'ASHA Worker',
    sections: [
      {
        label: 'Main',
        links: [
          { href: '/asha/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/asha/patients', label: 'Patients', icon: Users },
          { href: '/asha/tickets', label: 'Health Tickets', icon: FileText },
          { href: '/asha/pregnancy', label: 'Pregnancy', icon: Heart },
        ]
      },
      {
        label: 'Care',
        links: [
          { href: '/asha/referrals', label: 'Referrals', icon: ArrowRightLeft },
          { href: '/asha/followups', label: 'Follow-ups', icon: CalendarCheck },
          { href: '/asha/facilities', label: 'Healthcare Facilities', icon: Building2 },
        ]
      },
      {
        label: 'Tools',
        links: [
          { href: '/asha/voice', label: 'ArogyaVani', icon: Mic },
          { href: '/asha/education', label: 'SwasthyaGyan', icon: BookOpen },
          { href: '/asha/sync', label: 'Sync', icon: RefreshCw },
        ]
      },
    ]
  },
  doctor: {
    label: 'Doctor',
    sections: [
      {
        label: 'Main',
        links: [
          { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/doctor/referrals', label: 'Referrals', icon: ArrowRightLeft },
          { href: '/doctor/patients', label: 'Patients', icon: Users },
          { href: '/doctor/tickets', label: 'Health Tickets', icon: FileText },
        ]
      },
      {
        label: 'Clinical',
        links: [
          { href: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
          { href: '/doctor/followups', label: 'Follow-ups', icon: CalendarCheck },
        ]
      },
    ]
  },
  patient: {
    label: 'Patient',
    sections: [
      {
        label: 'Main',
        links: [
          { href: '/patient/home', label: 'Home', icon: Home },
          { href: '/patient/voice', label: 'Voice Assistant', icon: Mic },
          { href: '/patient/health-info', label: 'Health Information', icon: BookOpen },
          { href: '/patient/ticket', label: 'My Health Ticket', icon: FileText },
          { href: '/patient/followups', label: 'Follow-ups', icon: CalendarCheck },
        ]
      },
    ]
  },
  admin: {
    label: 'Administrator',
    sections: [
      {
        label: 'Main',
        links: [
          { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/admin/phcs', label: 'PHCs', icon: Building2 },
          { href: '/admin/workers', label: 'Workers', icon: Users },
          { href: '/admin/referrals', label: 'Referrals', icon: ArrowRightLeft },
          { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        ]
      },
    ]
  },
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navConfig = NAV_CONFIG[user.role];
  if (!navConfig) return null;

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="sidebar-brand">ArogyaSetu AI</div>
            <div className="sidebar-subtitle">{navConfig.label} Portal</div>
          </div>
          <button className="btn btn-icon" onClick={onClose} style={{ color: 'white', display: open ? 'flex' : 'none' }} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navConfig.sections.map((section, i) => (
          <div key={i}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{getInitials(user.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{user.name}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.6 }}>{navConfig.label}</div>
          </div>
          <button className="btn btn-icon" onClick={logout} title="Logout" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
