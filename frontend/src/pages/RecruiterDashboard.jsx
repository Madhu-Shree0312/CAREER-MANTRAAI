import { useState, useEffect } from 'react';
import { 
  Plus, 
  Briefcase, 
  Users, 
  Edit, 
  Trash2, 
  Upload,
  Download,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Sparkles,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [generatingField, setGeneratingField] = useState(null); // 'description' | 'requirements'

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
    contactEmail: '',
    applicationDeadline: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/recruiter/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/recruiter/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const endpoint = editingJob 
        ? `${API_BASE_URL}/api/recruiter/jobs/${editingJob.id}`
        : `${API_BASE_URL}/api/recruiter/jobs`;
      
      const method = editingJob ? 'PUT' : 'POST';
      
      await axios({
        method,
        url: endpoint,
        data: jobForm,
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(editingJob ? 'Job updated successfully!' : 'Job posted successfully!');
      setShowJobForm(false);
      setEditingJob(null);
      setJobForm({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        salary: '',
        description: '',
        requirements: '',
        contactEmail: '',
        applicationDeadline: ''
      });
      fetchJobs();
    } catch (error) {
      console.error('Failed to save job:', error);
      alert('Failed to save job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      contactEmail: job.contactEmail,
      applicationDeadline: job.applicationDeadline
    });
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/recruiter/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Job deleted successfully!');
      fetchJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  const downloadResume = (applicationId, fileName) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/api/recruiter/applications/${applicationId}/resume`;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateWithAI = async (field) => {
    if (!jobForm.title.trim()) {
      alert('Please enter a Job Title first so AI knows what to generate.');
      return;
    }
    setGeneratingField(field);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/recruiter/generate-job-content`,
        { title: jobForm.title, company: jobForm.company, location: jobForm.location, type: jobForm.type, field },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobForm(f => ({ ...f, [field]: res.data.content }));
    } catch (err) {
      alert('AI generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setGeneratingField(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-400" />
            Recruiter Dashboard
          </h1>
          <p className="text-blue-200">Manage job postings and review applications</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-lg max-w-md">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            My Jobs
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            Applications
          </button>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Job Postings</h2>
              <button
                onClick={() => setShowJobForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Post New Job
              </button>
            </div>

            <div className="grid gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                      <div className="flex items-center gap-4 text-blue-200 text-sm">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditJob(job)}
                        className="p-2 bg-blue-500/20 text-blue-200 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-white/80 mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-white/60 text-sm">
                      <span>Applications: {job.applicationCount || 0}</span>
                      <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'active' 
                        ? 'bg-green-500/20 text-green-200 border border-green-500/50'
                        : 'bg-gray-500/20 text-gray-200 border border-gray-500/50'
                    }`}>
                      {job.status || 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Job Applications</h2>
            
            <div className="space-y-6">
              {applications.map((application) => (
                <div key={application.id} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{application.fullName}</h3>
                          <p className="text-blue-200">{application.jobTitle} at {application.company}</p>
                        </div>
                        <span className="text-white/60 text-sm">
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-white/80">
                          <Mail className="w-4 h-4 text-blue-400" />
                          {application.email}
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                          <Phone className="w-4 h-4 text-green-400" />
                          {application.phone}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-2">Cover Letter:</h4>
                        <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                          {application.coverLetter}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-2">Experience:</h4>
                        <p className="text-white/70 text-sm">{application.experience} years</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Resume
                        </h4>
                        {application.resumeFileName ? (
                          <button
                            onClick={() => downloadResume(application.id, application.resumeFileName)}
                            className="w-full flex items-center gap-2 p-2 bg-blue-500/20 text-blue-200 rounded-lg hover:bg-blue-500/30 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            {application.resumeFileName}
                          </button>
                        ) : (
                          <p className="text-white/50 text-sm">No resume uploaded</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button className="w-full py-2 px-4 bg-green-600/20 border border-green-500/50 text-green-200 rounded-lg font-medium hover:bg-green-600/30 transition-all">
                          Contact Applicant
                        </button>
                        <button className="w-full py-2 px-4 bg-blue-600/20 border border-blue-500/50 text-blue-200 rounded-lg font-medium hover:bg-blue-600/30 transition-all">
                          Schedule Interview
                        </button>
                        <button className="w-full py-2 px-4 bg-red-600/20 border border-red-500/50 text-red-200 rounded-lg font-medium hover:bg-red-600/30 transition-all">
                          Reject Application
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {applications.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No applications yet</h3>
                  <p className="text-white/60">Applications will appear here once candidates apply to your jobs</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Form Modal */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-6">
                {editingJob ? 'Edit Job Posting' : 'Post New Job'}
              </h3>
              
              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">Job Title</label>
                    <input
                      type="text"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Frontend Developer"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">Company</label>
                    <input
                      type="text"
                      value={jobForm.company}
                      onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Company name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. San Francisco, CA or Remote"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">Job Type</label>
                    <select
                      value={jobForm.type}
                      onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">Salary Range</label>
                    <input
                      type="text"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. $80,000 - $120,000"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={jobForm.contactEmail}
                      onChange={(e) => setJobForm({ ...jobForm, contactEmail: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="recruiter@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Application Deadline</label>
                  <input
                    type="date"
                    value={jobForm.applicationDeadline}
                    onChange={(e) => setJobForm({ ...jobForm, applicationDeadline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-white/90 text-sm font-medium">Job Description</label>
                    <button
                      type="button"
                      onClick={() => generateWithAI('description')}
                      disabled={generatingField === 'description'}
                      className="flex items-center gap-1.5 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-purple-300 hover:text-purple-200 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                    >
                      {generatingField === 'description'
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                        : <><Sparkles className="w-3 h-3" /> Generate with AI</>
                      }
                    </button>
                  </div>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Describe the role, responsibilities, and what you're looking for... or click Generate with AI ✨"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-white/90 text-sm font-medium">Requirements</label>
                    <button
                      type="button"
                      onClick={() => generateWithAI('requirements')}
                      disabled={generatingField === 'requirements'}
                      className="flex items-center gap-1.5 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-purple-300 hover:text-purple-200 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                    >
                      {generatingField === 'requirements'
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                        : <><Sparkles className="w-3 h-3" /> Generate with AI</>
                      }
                    </button>
                  </div>
                  <textarea
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="List required skills, experience, qualifications... or click Generate with AI ✨"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Saving...' : (editingJob ? 'Update Job' : 'Post Job')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                      setJobForm({
                        title: '',
                        company: '',
                        location: '',
                        type: 'Full-time',
                        salary: '',
                        description: '',
                        requirements: '',
                        contactEmail: '',
                        applicationDeadline: ''
                      });
                    }}
                    className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;