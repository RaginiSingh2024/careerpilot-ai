import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResumeJobAnalysisPage } from './pages/ResumeJobAnalysisPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { AgentActivityPage } from './pages/AgentActivityPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="resume" element={<ResumeJobAnalysisPage />} />
        <Route path="skill-gaps" element={<SkillGapPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="interviews" element={<MockInterviewPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="agents" element={<AgentActivityPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

