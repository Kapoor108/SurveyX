import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const SurveyReport = () => {
  const { orgId, surveyId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aspect, setAspect] = useState('present');

  useEffect(() => {
    loadReport();
  }, [surveyId]);

  const loadReport = async () => {
    try {
      const res = await api.get(`/reports/surveys/${surveyId}`);
      setReport(res.data);
    } catch (error) {
      console.error('Load report error:', error);
      alert('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (band) => {
    if (band === 'Leading') return 'bg-green-100 text-green-700';
    if (band === 'Emerging') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getQuadrantColor = (quadrant) => {
    const colors = {
      'Hope in Action (IGEN Zone)': 'bg-green-500',
      'Unbounded Power': 'bg-blue-500',
      'Safe Stagnation': 'bg-orange-500',
      'Extraction Engine': 'bg-red-500'
    };
    return colors[quadrant] || 'bg-gray-500';
  };

  const downloadReport = () => {
    if (!report) return;

    // Calculate both aspects
    const presentData = calculateAggregates('present');
    const futureData = calculateAggregates('future');

    const doc = new jsPDF();
    let yPos = 20;

    // Helper function to render aspect section
    const renderAspectSection = (aspectType, aspectData, isFirstSection) => {
      const avgCreativity = parseFloat(aspectData.avgCreativityPercentage);
      const avgMorality = parseFloat(aspectData.avgMoralityPercentage);
      const creativityBand = getBand(avgCreativity);
      const moralityBand = getBand(avgMorality);
      
      // Determine quadrant
      let currentQuadrant = 'Extraction Engine';
      if (avgCreativity >= 50 && avgMorality >= 50) currentQuadrant = 'Hope in Action (IGEN Zone)';
      else if (avgCreativity >= 50 && avgMorality < 50) currentQuadrant = 'Unbounded Power';
      else if (avgCreativity < 50 && avgMorality >= 50) currentQuadrant = 'Safe Stagnation';

      // Add new page if not first section
      if (!isFirstSection) {
        doc.addPage();
        yPos = 20;
      }

      // Section Title
      const headerColor = aspectType === 'present' ? [79, 70, 229] : [147, 51, 234];
      doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.rect(0, yPos - 10, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`${aspectType === 'present' ? 'PRESENT SCENARIO' : 'FUTURE SCENARIO'}`, 105, yPos, { align: 'center' });
      
      yPos += 15;
      doc.setTextColor(0, 0, 0);

      // Key Metrics
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Key Metrics', 20, yPos);
      yPos += 10;

      const metrics = [
        { label: 'Avg Creativity', value: `${avgCreativity}%`, bgColor: [60, 60, 60] },
        { label: 'Avg Morality', value: `${avgMorality}%`, bgColor: [60, 60, 60] },
        { label: 'Creativity Band', value: creativityBand, bgColor: [60, 60, 60] },
        { label: 'Morality Band', value: moralityBand, bgColor: [60, 60, 60] }
      ];

      metrics.forEach((metric, i) => {
        const xPos = 20 + (i % 2) * 95;
        const boxY = yPos + Math.floor(i / 2) * 25;
        
        doc.setFillColor(60, 60, 60);
        doc.roundedRect(xPos, boxY, 85, 20, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(metric.label, xPos + 5, boxY + 7);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(metric.value, xPos + 5, boxY + 15);
        doc.setFont(undefined, 'normal');
      });

      yPos += 60;

      // AI & Humanity Matrix
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('AI & Humanity Matrix', 20, yPos);
      yPos += 10;

      const matrixSize = 80;
      const matrixX = 60;
      const matrixY = yPos;

      const quadrants = [
        { name: 'Safe Stagnation', x: 0, y: 0, darkColor: [255, 140, 0], lightColor: [255, 200, 150], count: aspectData.quadrantDistribution['Safe Stagnation'] || 0, quadrantName: 'Safe Stagnation' },
        { name: 'Hope in Action', x: 1, y: 0, darkColor: [34, 139, 34], lightColor: [144, 238, 144], count: aspectData.quadrantDistribution['Hope in Action (IGEN Zone)'] || 0, quadrantName: 'Hope in Action (IGEN Zone)' },
        { name: 'Extraction Engine', x: 0, y: 1, darkColor: [220, 20, 60], lightColor: [255, 182, 193], count: aspectData.quadrantDistribution['Extraction Engine'] || 0, quadrantName: 'Extraction Engine' },
        { name: 'Unbounded Power', x: 1, y: 1, darkColor: [30, 144, 255], lightColor: [173, 216, 230], count: aspectData.quadrantDistribution['Unbounded Power'] || 0, quadrantName: 'Unbounded Power' }
      ];

      quadrants.forEach(q => {
        const isCurrentQuadrant = q.quadrantName === currentQuadrant;
        
        const qX = matrixX + q.x * matrixSize / 2;
        const qY = matrixY + q.y * matrixSize / 2;
        const qSize = matrixSize / 2;
        
        const gradientSteps = 20;
        for (let i = 0; i < gradientSteps; i++) {
          const ratio = i / gradientSteps;
          const r = Math.round(q.darkColor[0] + (q.lightColor[0] - q.darkColor[0]) * ratio);
          const g = Math.round(q.darkColor[1] + (q.lightColor[1] - q.darkColor[1]) * ratio);
          const b = Math.round(q.darkColor[2] + (q.lightColor[2] - q.darkColor[2]) * ratio);
          
          const opacity = isCurrentQuadrant ? 1 : 0.3;
          doc.setFillColor(r, g, b, opacity);
          doc.rect(qX, qY + (i * qSize / gradientSteps), qSize, qSize / gradientSteps + 0.5, 'F');
        }
        
        if (isCurrentQuadrant) {
          doc.setDrawColor(q.darkColor[0], q.darkColor[1], q.darkColor[2]);
          doc.setLineWidth(3);
          doc.rect(qX, qY, qSize, qSize);
          doc.setLineWidth(0.1);
        } else {
          doc.setDrawColor(100, 100, 100);
          doc.setLineWidth(0.5);
          doc.rect(qX, qY, qSize, qSize);
          doc.setLineWidth(0.1);
        }
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(isCurrentQuadrant ? 255 : 80, isCurrentQuadrant ? 255 : 80, isCurrentQuadrant ? 255 : 80);
        const textX = qX + qSize / 2;
        const textY = qY + qSize / 2 - 5;
        doc.text(q.name, textX, textY, { align: 'center', maxWidth: qSize - 5 });
        doc.setFontSize(12);
        doc.text(`${q.count}`, textX, textY + 8, { align: 'center' });
        
        if (isCurrentQuadrant) {
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(q.darkColor[0], q.darkColor[1], q.darkColor[2]);
          doc.roundedRect(textX - 15, textY + 15, 30, 6, 2, 2, 'F');
          doc.text('YOU ARE HERE', textX, textY + 19, { align: 'center' });
        }
        
        doc.setFont(undefined, 'normal');
      });

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Creativity', matrixX - 15, matrixY + matrixSize / 2, { angle: 90 });
      doc.text('Morality', matrixX + matrixSize / 2, matrixY + matrixSize + 8, { align: 'center' });

      yPos += matrixSize + 20;

      // Overall Assessment
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Overall Assessment', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      let assessment = '';
      
      if (currentQuadrant === 'Hope in Action (IGEN Zone)') {
        assessment = 'Excellent! Your organization demonstrates strong performance in both creativity and morality. ' +
          'You are in the ideal IGEN Zone, showing trusted innovation and responsible scaling practices. ' +
          'Continue to maintain these high standards while exploring new opportunities for growth.';
      } else if (currentQuadrant === 'Unbounded Power') {
        assessment = 'Your organization shows high creativity but needs improvement in morality. ' +
          'While innovation is strong, there are concerns about ethical considerations and responsible practices. ' +
          'Focus on establishing moral boundaries, accountability frameworks, and stakeholder engagement.';
      } else if (currentQuadrant === 'Safe Stagnation') {
        assessment = 'Your organization demonstrates good moral practices but lacks creative innovation. ' +
          'While ethical considerations are strong, there is room for improvement in innovative thinking. ' +
          'Encourage experimentation, creative problem-solving, and calculated risk-taking.';
      } else {
        assessment = 'Critical attention needed. Both creativity and morality scores are below optimal levels. ' +
          'This indicates significant risks in both innovation capacity and ethical practices. ' +
          'Immediate action is required to improve both dimensions through training, policy changes, and cultural transformation.';
      }

      const splitAssessment = doc.splitTextToSize(assessment, 170);
      doc.text(splitAssessment, 20, yPos);
      yPos += splitAssessment.length * 5 + 10;

      // Individual Scores Table
      doc.addPage();
      yPos = 20;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Individual Employee Scores - ${aspectType === 'present' ? 'Present' : 'Future'}`, 20, yPos);
      yPos += 10;

      const tableData = report.responses.map(r => {
        const scores = r.scores[aspectType];
        return [
          r.employee.name,
          r.employee.department,
          `${scores?.creativity_percentage || 0}%`,
          `${scores?.morality_percentage || 0}%`,
          scores?.creativity_band || 'N/A',
          scores?.morality_band || 'N/A',
          scores?.quadrant || 'N/A'
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Employee', 'Department', 'Creativity %', 'Morality %', 'C Band', 'M Band', 'Quadrant']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: aspectType === 'present' ? [79, 70, 229] : [147, 51, 234], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
          6: { cellWidth: 35 }
        }
      });
    };

    // Title Page
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('AI & Humanity Survey Report', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(report.survey.organization.name, 105, 30, { align: 'center' });

    yPos = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(report.survey.title, 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
    
    yPos += 5;
    doc.text(`Total Responses: ${report.totalResponses}`, 20, yPos);
    doc.text(`Questions: ${report.survey.questionCount}`, 120, yPos);

    // Executive Summary
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Executive Summary', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const summaryText = `This comprehensive report analyzes ${report.totalResponses} survey responses from ${report.survey.organization.name} ` +
      `to assess the organization's AI readiness across creativity and morality dimensions for both present and future scenarios. ` +
      `The report provides detailed insights into current capabilities and future aspirations, helping identify gaps and opportunities for growth.`;
    
    const splitSummary = doc.splitTextToSize(summaryText, 170);
    doc.text(splitSummary, 20, yPos);
    yPos += splitSummary.length * 5 + 10;

    // Render Present Scenario
    doc.addPage();
    renderAspectSection('present', presentData, true);

    // Render Future Scenario
    renderAspectSection('future', futureData, false);

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text(`${report.survey.organization.name} - Confidential`, 20, 290);
    }

    // Save PDF
    const fileName = `${report.survey.organization.name}_${report.survey.title}_Complete_Report.pdf`;
    doc.save(fileName);
  };

  const calculateAggregates = (aspectType) => {
    if (!report || !report.responses || report.responses.length === 0) {
      return {
        avgCreativityPercentage: '0.0',
        avgMoralityPercentage: '0.0',
        quadrantDistribution: {}
      };
    }

    const responses = report.responses;
    const avgCreativity = (responses.reduce((sum, r) => sum + (r.scores[aspectType]?.creativity_percentage || 0), 0) / responses.length).toFixed(1);
    const avgMorality = (responses.reduce((sum, r) => sum + (r.scores[aspectType]?.morality_percentage || 0), 0) / responses.length).toFixed(1);

    const quadrantDist = {};
    responses.forEach(r => {
      const quad = r.scores[aspectType]?.quadrant || 'Unknown';
      quadrantDist[quad] = (quadrantDist[quad] || 0) + 1;
    });

    return {
      avgCreativityPercentage: avgCreativity,
      avgMoralityPercentage: avgMorality,
      quadrantDistribution: quadrantDist
    };
  };

  if (loading) {
    return (
      <AdminLayout title="Survey Report">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!report || report.totalResponses === 0) {
    return (
      <AdminLayout title="Survey Report">
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No responses yet for this survey</p>
          <p className="text-sm text-gray-400 mt-1">Reports will be available once employees submit their responses</p>
          <button onClick={() => navigate(`/admin/organizations/${orgId}`)} className="mt-4 text-indigo-600 hover:text-indigo-800">
            Back to Organization
          </button>
        </div>
      </AdminLayout>
    );
  }

  const aspectData = calculateAggregates(aspect);
  const avgCreativity = parseFloat(aspectData.avgCreativityPercentage);
  const avgMorality = parseFloat(aspectData.avgMoralityPercentage);
  const creativityBand = getBand(avgCreativity);
  const moralityBand = getBand(avgMorality);

  return (
    <AdminLayout title={`Report: ${report.survey.title}`}>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{report.survey.title}</h2>
            <p className="text-indigo-100">{report.survey.organization.name} • {report.totalResponses} Responses</p>
          </div>
          <button
            onClick={() => navigate(`/admin/organizations/${orgId}`)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            Back to Organization
          </button>
        </div>
      </div>

      {/* Aspect Toggle & Download */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setAspect('present')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                aspect === 'present'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Present Scenario
            </button>
            <button
              onClick={() => setAspect('future')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                aspect === 'future'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Future Scenario
            </button>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          {aspect === 'present' ? 'Present Scenario' : 'Future Scenario'} - Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
            <p className="text-sm text-blue-600 font-semibold mb-2">Avg Creativity</p>
            <p className="text-4xl font-bold text-blue-700">{aspectData.avgCreativityPercentage}%</p>
            <p className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${getBandColor(creativityBand)}`}>
              {creativityBand}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
            <p className="text-sm text-green-600 font-semibold mb-2">Avg Morality</p>
            <p className="text-4xl font-bold text-green-700">{aspectData.avgMoralityPercentage}%</p>
            <p className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${getBandColor(moralityBand)}`}>
              {moralityBand}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
            <p className="text-sm text-purple-600 font-semibold mb-2">Total Responses</p>
            <p className="text-4xl font-bold text-purple-700">{report.totalResponses}</p>
            <p className="text-xs text-purple-600 mt-2">Completed surveys</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
            <p className="text-sm text-orange-600 font-semibold mb-2">Questions</p>
            <p className="text-4xl font-bold text-orange-700">{report.survey.questionCount}</p>
            <p className="text-xs text-orange-600 mt-2">Survey questions</p>
          </div>
        </div>
      </div>

      {/* AI & Humanity Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">AI & Humanity Matrix</h3>
        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2">
            {/* Top Left - Safe Stagnation */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-6 flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <h4 className="text-lg font-bold">Safe Stagnation</h4>
                </div>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• Committee Caution</li>
                  <li>• Missed Opportunity</li>
                </ul>
              </div>
              <p className="text-xs font-semibold">
                {aspectData.quadrantDistribution['Safe Stagnation'] || 0} employees
              </p>
            </div>

            {/* Top Right - Hope in Action */}
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-6 flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h4 className="text-lg font-bold">Hope in Action</h4>
                </div>
                <p className="text-sm font-semibold mb-1">(IGEN Zone)</p>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• Trusted Innovation</li>
                  <li>• Responsible Scale</li>
                </ul>
              </div>
              <p className="text-xs font-semibold">
                {aspectData.quadrantDistribution['Hope in Action (IGEN Zone)'] || 0} employees
              </p>
            </div>

            {/* Bottom Left - Extraction Engine */}
            <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-lg p-6 flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <h4 className="text-lg font-bold">Extraction Engine</h4>
                </div>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• Surveillance-First</li>
                  <li>• Exploitative Practices</li>
                </ul>
              </div>
              <p className="text-xs font-semibold">
                {aspectData.quadrantDistribution['Extraction Engine'] || 0} employees
              </p>
            </div>

            {/* Bottom Right - Unbounded Power */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-6 flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <h4 className="text-lg font-bold">Unbounded Power</h4>
                </div>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• Autonomous Agents</li>
                  <li>• Unsafe Automation</li>
                </ul>
              </div>
              <p className="text-xs font-semibold">
                {aspectData.quadrantDistribution['Unbounded Power'] || 0} employees
              </p>
            </div>
          </div>

          {/* Axis Labels */}
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90">
            <p className="text-sm font-bold text-gray-700">Creativity</p>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8">
            <p className="text-sm font-bold text-gray-700">Morality</p>
          </div>
          <div className="absolute -left-12 top-2">
            <p className="text-xs text-gray-500">High</p>
          </div>
          <div className="absolute -left-12 bottom-2">
            <p className="text-xs text-gray-500">Low</p>
          </div>
          <div className="absolute -bottom-6 left-2">
            <p className="text-xs text-gray-500">Low</p>
          </div>
          <div className="absolute -bottom-6 right-2">
            <p className="text-xs text-gray-500">High</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-6 text-white mb-6">
        <h3 className="text-xl font-bold mb-4">Recommendations: Moving to the Top Right (IGEN Zone)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Set Moral Boundaries</p>
              <p className="text-sm text-gray-300">Create a do-not-automate list + establish accountability frameworks</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Design for Trust</p>
              <p className="text-sm text-gray-300">Implement Trust Contracts + logging + escalation procedures</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Prove Value</p>
              <p className="text-sm text-gray-300">Maintain Value Ledger + implement scale gates for controlled growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zones & Solutions */}
      {(avgCreativity < 40 || avgMorality < 40) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-8 h-8 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ Danger Zone Detected</h3>
              <p className="text-red-800 mb-4">
                {avgCreativity < 40 && avgMorality < 40 && 'Both Creativity and Morality scores are in the Early stage (below 40%). This indicates significant risks.'}
                {avgCreativity < 40 && avgMorality >= 40 && 'Creativity score is in the Early stage (below 40%). Innovation and creative thinking need improvement.'}
                {avgCreativity >= 40 && avgMorality < 40 && 'Morality score is in the Early stage (below 40%). Ethical considerations and responsible practices need attention.'}
              </p>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3">Immediate Actions Required:</h4>
                <ul className="space-y-2 text-sm text-red-800">
                  {avgCreativity < 40 && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span><strong>Boost Innovation:</strong> Organize brainstorming sessions, encourage experimentation, and create safe spaces for creative thinking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span><strong>Training Programs:</strong> Invest in creativity workshops and design thinking training for employees</span>
                      </li>
                    </>
                  )}
                  {avgMorality < 40 && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span><strong>Ethics Framework:</strong> Establish clear ethical guidelines and decision-making frameworks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span><strong>Accountability Systems:</strong> Implement transparent reporting and accountability mechanisms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span><strong>Stakeholder Engagement:</strong> Increase focus on stakeholder impact and responsible practices</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Employee Scores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Individual Employee Scores</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creativity %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Morality %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creativity Band</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Morality Band</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quadrant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.responses.map((response, idx) => {
                const scores = response.scores[aspect];
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{response.employee.name}</td>
                    <td className="px-6 py-4 text-gray-600">{response.employee.department}</td>
                    <td className="px-6 py-4">
                      <span className="text-blue-600 font-semibold">{scores?.creativity_percentage || 0}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 font-semibold">{scores?.morality_percentage || 0}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBandColor(scores?.creativity_band || 'Early')}`}>
                        {scores?.creativity_band || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBandColor(scores?.morality_band || 'Early')}`}>
                        {scores?.morality_band || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getQuadrantColor(scores?.quadrant || 'Unknown')}`}>
                        {scores?.quadrant || 'N/A'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

// Helper function for band calculation
const getBand = (percentage) => {
  if (percentage < 40) return 'Early';
  if (percentage < 50) return 'Emerging';
  return 'Leading';
};

export default SurveyReport;
