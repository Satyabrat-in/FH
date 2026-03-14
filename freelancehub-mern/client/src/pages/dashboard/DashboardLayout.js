import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import DashboardHome from './DashboardHome';
import ProfilePage from './ProfilePage';
import MessagesPage from './MessagesPage';
import ContractsPage from './ContractsPage';
import EarningsPage from './EarningsPage';
import MyGigsPage from './MyGigsPage';
import ApplicationsPage from './ApplicationsPage';
import PostJobPage from './PostJobPage';
import ClaudeAIPage from './ClaudeAIPage';
import MyJobsPage from './MyJobsPage';
import TalentSearchPage from './TalentSearchPage';
import FindWorkPage from './FindWorkPage';

const DashboardLayout = () => (
  <div style={{ display: 'flex', minHeight: 'calc(100vh - 68px)' }}>
    <Sidebar />
    <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="earnings" element={<EarningsPage />} />
        <Route path="gigs" element={<MyGigsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="proposals" element={<ApplicationsPage />} />
        <Route path="post-job" element={<PostJobPage />} />
        <Route path="my-jobs" element={<MyJobsPage />} />
        <Route path="find-work" element={<FindWorkPage />} />
        <Route path="talent" element={<TalentSearchPage />} />
        <Route path="claude-ai" element={<ClaudeAIPage />} />
        <Route path="*" element={<DashboardHome />} />
      </Routes>
    </main>
  </div>
);

export default DashboardLayout;
