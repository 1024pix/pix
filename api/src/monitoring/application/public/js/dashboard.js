// Query Visualization Dashboard

class QueryVizDashboard {
  constructor() {
    this.requests = [];
    this.eventSource = null;
    this.autoScroll = true;
    this.filterSlow = false;
    this.slowThreshold = 50;

    // Pool metrics history - keep last 60 data points (5 minutes at 5s interval)
    this.poolHistory = {
      timestamps: [],
      db: { used: [], free: [], pending: [], creates: [], min: [], max: [] },
      datamart: { used: [], free: [], pending: [], creates: [], min: [], max: [] },
      datawarehouse: { used: [], free: [], pending: [], creates: [], min: [], max: [] },
    };
    this.maxHistoryPoints = 60;

    this.init();
  }

  async init() {
    // Load initial data
    await this.loadInitialData();

    // Setup SSE connection
    this.connectSSE();

    // Setup event listeners
    this.setupEventListeners();

    // Initial render
    this.render();

    // Refresh pool metrics every 5 seconds
    setInterval(() => {
      this.fetchPoolMetrics();
    }, 5000);
  }

  async loadInitialData() {
    try {
      const response = await fetch('/api/query-viz/data');
      const data = await response.json();

      this.requests = data.requests || [];
      this.updateStats(data.stats);
      this.updatePoolMetrics(data.poolMetrics);

      console.log('[Dashboard] Initial data loaded:', this.requests.length, 'requests');
    } catch (error) {
      console.error('[Dashboard] Error loading initial data:', error);
    }
  }

  connectSSE() {
    this.updateSSEStatus('Connecting...', 'disconnected');

    this.eventSource = new EventSource('/api/query-viz/stream');

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleSSEMessage(data);
    };

    this.eventSource.onopen = () => {
      console.log('[Dashboard] SSE connected');
      this.updateSSEStatus('Connected', 'connected');
    };

    this.eventSource.onerror = (error) => {
      console.error('[Dashboard] SSE error:', error);
      this.updateSSEStatus('Disconnected', 'disconnected');

      // Reconnect after 5 seconds
      setTimeout(() => {
        console.log('[Dashboard] Reconnecting SSE...');
        this.connectSSE();
      }, 5000);
    };
  }

  handleSSEMessage(data) {
    console.log('[Dashboard] SSE message:', data.type, data);

    switch (data.type) {
      case 'connected':
        console.log('[Dashboard] SSE client ID:', data.clientId);
        break;

      case 'request-complete':
        this.requests.unshift(data.data);

        // Keep only last 100 requests
        if (this.requests.length > 100) {
          this.requests = this.requests.slice(0, 100);
        }

        // Update stats
        this.updateStats({
          activeRequests: 0, // All requests in list are completed
          historicalRequests: this.requests.length,
        });

        this.render();
        break;

      case 'data-cleared':
        this.requests = [];
        this.updateStats({ activeRequests: 0, historicalRequests: 0 });
        this.render();
        break;

      case 'ping':
        // Heartbeat - refresh pool metrics
        this.fetchPoolMetrics();
        break;

      default:
        console.warn('[Dashboard] Unknown SSE message type:', data.type);
    }
  }

  setupEventListeners() {
    // Clear button
    document.getElementById('btn-clear').addEventListener('click', () => {
      this.clearData();
    });

    // Filter slow queries
    document.getElementById('filter-slow').addEventListener('change', (e) => {
      this.filterSlow = e.target.checked;
      this.render();
    });

    // Auto scroll toggle
    document.getElementById('auto-scroll').addEventListener('change', (e) => {
      this.autoScroll = e.target.checked;
    });

    // Modal close
    const modal = document.getElementById('query-detail-modal');
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  async clearData() {
    try {
      await fetch('/api/query-viz/clear', { method: 'POST' });
      console.log('[Dashboard] Data cleared');
    } catch (error) {
      console.error('[Dashboard] Error clearing data:', error);
    }
  }

  updateSSEStatus(text, className) {
    const statusEl = document.getElementById('sse-status');
    statusEl.textContent = text;
    statusEl.className = 'stat-value ' + className;
  }

  updateStats(stats) {
    if (!stats) return;

    document.getElementById('stat-active').textContent = stats.activeRequests || 0;
    document.getElementById('stat-historical').textContent = stats.historicalRequests || 0;
  }

  updatePoolMetrics(poolMetrics) {
    if (!poolMetrics || Object.keys(poolMetrics).length === 0) {
      const container = document.getElementById('pool-metrics');
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No pool metrics available yet. Make some API calls to see connection pool usage.</div>';
      return;
    }

    // Add to history
    const now = Date.now();
    this.poolHistory.timestamps.push(now);

    Object.entries(poolMetrics).forEach(([poolName, metrics]) => {
      if (!this.poolHistory[poolName]) {
        this.poolHistory[poolName] = { used: [], free: [], pending: [], creates: [], min: [], max: [] };
      }

      this.poolHistory[poolName].used.push(metrics.used || 0);
      this.poolHistory[poolName].free.push(metrics.free || 0);
      this.poolHistory[poolName].pending.push(metrics.pendingAcquires || 0);
      this.poolHistory[poolName].creates.push(metrics.pendingCreates || 0);
      this.poolHistory[poolName].min.push(metrics.min || 0);
      this.poolHistory[poolName].max.push(metrics.max || 0);
    });

    // Trim history to max points
    if (this.poolHistory.timestamps.length > this.maxHistoryPoints) {
      const excess = this.poolHistory.timestamps.length - this.maxHistoryPoints;
      this.poolHistory.timestamps.splice(0, excess);

      Object.keys(this.poolHistory).forEach(key => {
        if (key !== 'timestamps' && this.poolHistory[key].used) {
          this.poolHistory[key].used.splice(0, excess);
          this.poolHistory[key].free.splice(0, excess);
          this.poolHistory[key].pending.splice(0, excess);
          this.poolHistory[key].creates.splice(0, excess);
          this.poolHistory[key].min.splice(0, excess);
          this.poolHistory[key].max.splice(0, excess);
        }
      });
    }

    // Render charts
    this.renderPoolCharts(poolMetrics);
  }

  renderPoolCharts(poolMetrics) {
    const container = document.getElementById('pool-metrics');
    container.innerHTML = '';

    Object.entries(poolMetrics).forEach(([poolName, metrics]) => {
      const card = document.createElement('div');
      card.className = 'pool-card';
      card.style.minHeight = '250px';

      const chartId = `pool-chart-${poolName}`;

      const used = metrics.used || 0;
      const free = metrics.free || 0;
      const total = used + free;

      card.innerHTML = `
        <div class="pool-name">${poolName}</div>
        <div class="pool-stats" style="margin-bottom: 10px;">
          <div>🔵 Used: <strong>${used}</strong></div>
          <div>⚪ Free: <strong>${free}</strong></div>
          <div>⏳ Pending Acquires: <strong>${metrics.pendingAcquires || 0}</strong></div>
          <div>🔄 Pending Creates: <strong>${metrics.pendingCreates || 0}</strong></div>
          <div>📊 Min: <strong>${metrics.min || 0}</strong></div>
          <div>📊 Max: <strong>${metrics.max || 0}</strong></div>
          <div>Total: ${total}</div>
        </div>
        <div id="${chartId}" class="pool-chart"></div>
      `;

      container.appendChild(card);

      // Render D3 chart
      this.renderPoolChart(chartId, poolName, metrics.max || total);
    });
  }

  renderPoolChart(containerId, poolName, maxConnections) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const history = this.poolHistory[poolName];
    if (!history || history.used.length === 0) return;

    // Clear previous chart
    d3.select(`#${containerId}`).selectAll('*').remove();

    // Dimensions
    const margin = { top: 10, right: 100, bottom: 30, left: 40 };
    const width = container.offsetWidth - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, this.poolHistory.timestamps.length - 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, maxConnections])
      .range([height, 0]);

    // Line generators
    const lineGenerator = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    // Add grid
    svg.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('')
      );

    // Draw lines
    // Used line (blue)
    svg.append('path')
      .datum(history.used)
      .attr('fill', 'none')
      .attr('stroke', '#3498db')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Free line (green)
    svg.append('path')
      .datum(history.free)
      .attr('fill', 'none')
      .attr('stroke', '#27ae60')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Pending Acquires line (orange, dashed)
    if (history.pending.some(p => p > 0)) {
      svg.append('path')
        .datum(history.pending)
        .attr('fill', 'none')
        .attr('stroke', '#e67e22')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', lineGenerator);
    }

    // Pending Creates line (red, dashed)
    if (history.creates && history.creates.some(p => p > 0)) {
      svg.append('path')
        .datum(history.creates)
        .attr('fill', 'none')
        .attr('stroke', '#e74c3c')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,3')
        .attr('d', lineGenerator);
    }

    // Min line (purple, dotted horizontal reference)
    if (history.min && history.min.length > 0) {
      const minValue = history.min[history.min.length - 1];
      svg.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(minValue))
        .attr('y2', yScale(minValue))
        .attr('stroke', '#9b59b6')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.7);
    }

    // Max line (dark gray, dotted horizontal reference)
    if (history.max && history.max.length > 0) {
      const maxValue = history.max[history.max.length - 1];
      svg.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(maxValue))
        .attr('y2', yScale(maxValue))
        .attr('stroke', '#34495e')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.7);
    }

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(''))
      .style('font-size', '10px');

    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .style('font-size', '10px');

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 5}, 0)`);

    const legendData = [
      { label: 'Used', color: '#3498db', dash: false },
      { label: 'Free', color: '#27ae60', dash: false },
      { label: 'Pend.Acq', color: '#e67e22', dash: '5,5' },
    ];

    if (history.creates && history.creates.some(p => p > 0)) {
      legendData.push({ label: 'Pend.Crt', color: '#e74c3c', dash: '3,3' });
    }

    if (history.min && history.min.length > 0) {
      legendData.push({ label: 'Min', color: '#9b59b6', dash: '2,2' });
    }

    if (history.max && history.max.length > 0) {
      legendData.push({ label: 'Max', color: '#34495e', dash: '2,2' });
    }

    legendData.forEach((item, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(0, ${i * 16})`);

      g.append('line')
        .attr('x1', 0)
        .attr('x2', 15)
        .attr('y1', 5)
        .attr('y2', 5)
        .attr('stroke', item.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', item.dash || '0');

      g.append('text')
        .attr('x', 20)
        .attr('y', 9)
        .style('font-size', '9px')
        .text(item.label);
    });

    // Add current value dots
    const lastIndex = history.used.length - 1;

    // Used dot
    svg.append('circle')
      .attr('cx', xScale(lastIndex))
      .attr('cy', yScale(history.used[lastIndex]))
      .attr('r', 3)
      .attr('fill', '#3498db');

    // Free dot
    svg.append('circle')
      .attr('cx', xScale(lastIndex))
      .attr('cy', yScale(history.free[lastIndex]))
      .attr('r', 3)
      .attr('fill', '#27ae60');

    // Pending Acquires dot
    if (history.pending[lastIndex] > 0) {
      svg.append('circle')
        .attr('cx', xScale(lastIndex))
        .attr('cy', yScale(history.pending[lastIndex]))
        .attr('r', 3)
        .attr('fill', '#e67e22');
    }

    // Pending Creates dot
    if (history.creates && history.creates[lastIndex] > 0) {
      svg.append('circle')
        .attr('cx', xScale(lastIndex))
        .attr('cy', yScale(history.creates[lastIndex]))
        .attr('r', 3)
        .attr('fill', '#e74c3c');
    }
  }

  render() {
    // Filter requests if needed
    let filteredRequests = this.requests;
    if (this.filterSlow) {
      filteredRequests = this.requests.filter(r => r.duration > this.slowThreshold);
    }

    // Update pool metrics from latest request
    this.updatePoolMetricsFromRequests(filteredRequests);

    // Render main timeline
    this.renderMainTimeline(filteredRequests.slice(0, 20)); // Show last 20 requests

    // Render requests list
    this.renderRequestsList(filteredRequests);

    // Auto scroll to top
    if (this.autoScroll) {
      const container = document.getElementById('requests-container');
      container.scrollTop = 0;
    }
  }

  updatePoolMetricsFromRequests(requests) {
    // Find the most recent request with pool metrics
    const requestWithMetrics = requests.find(r => r.poolMetrics && Object.keys(r.poolMetrics).length > 0);

    if (requestWithMetrics) {
      this.updatePoolMetrics(requestWithMetrics.poolMetrics);
    } else {
      // If no metrics in requests, fetch from API
      this.fetchPoolMetrics();
    }
  }

  async fetchPoolMetrics() {
    try {
      const response = await fetch('/api/query-viz/stats');
      const data = await response.json();

      if (data.pools && Object.keys(data.pools).length > 0) {
        this.updatePoolMetrics(data.pools);
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching pool metrics:', error);
    }
  }

  renderMainTimeline(requests) {
    const container = document.getElementById('timeline');

    if (requests.length === 0) {
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">No requests yet. Make some API calls to see query timeline visualization.</div>';
      return;
    }

    // Clear previous content
    container.innerHTML = '';

    // Setup dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 200 };
    const width = container.offsetWidth - margin.left - margin.right;
    const height = Math.max(400, requests.length * 50); // 50px per request

    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate scales
    const maxDuration = d3.max(requests, r => r.duration || 0);

    const xScale = d3.scaleLinear()
      .domain([0, maxDuration])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(requests.map((r, i) => i))
      .range([0, height])
      .padding(0.2);

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d => `${d.toFixed(0)}ms`);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .style('font-size', '11px');

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(10)
        .tickSize(-height)
        .tickFormat('')
      )
      .style('stroke', '#e0e0e0')
      .style('stroke-dasharray', '2,2');

    // Create request rows
    const requestGroups = svg.selectAll('.request-group')
      .data(requests)
      .enter()
      .append('g')
      .attr('class', 'request-group')
      .attr('transform', (d, i) => `translate(0,${yScale(i)})`);

    // Add request labels (left side)
    requestGroups.append('text')
      .attr('x', -10)
      .attr('y', yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '11px')
      .style('fill', '#333')
      .style('font-weight', '500')
      .text(d => `${d.method} ${this.truncatePath(d.routePath, 25)}`)
      .append('title')
      .text(d => `${d.method} ${d.routePath}\n${d.duration.toFixed(2)}ms - ${d.stats?.totalQueries || 0} queries`);

    // Add queries as rectangles
    requests.forEach((request, requestIndex) => {
      const queries = request.queries || [];
      if (queries.length === 0) return;

      const requestGroup = d3.select(requestGroups.nodes()[requestIndex]);
      const requestStartTime = queries[0]?.startTime || 0;

      queries.forEach((query) => {
        const relativeStart = query.startTime - requestStartTime;
        const queryDuration = query.duration || 0;

        // Determine color based on query type
        let color = '#3498db'; // default blue
        if (query.error) {
          color = '#e74c3c'; // red for errors
        } else if (query.isTransaction) {
          color = '#9b59b6'; // purple for transactions
        } else if (query.parallelGroup !== null) {
          color = '#e67e22'; // orange for parallel
        }

        requestGroup.append('rect')
          .attr('x', xScale(relativeStart))
          .attr('y', 0)
          .attr('width', Math.max(2, xScale(queryDuration)))
          .attr('height', yScale.bandwidth())
          .attr('fill', color)
          .attr('opacity', 0.8)
          .style('cursor', 'pointer')
          .on('mouseover', function() {
            d3.select(this).attr('opacity', 1);
          })
          .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.8);
          })
          .append('title')
          .text(`${query.sql.substring(0, 80)}...\nDuration: ${queryDuration.toFixed(2)}ms\nPool: ${query.pool}\n${query.isTransaction ? 'Transaction' : query.parallelGroup !== null ? 'Parallel' : 'Sequential'}`);
      });
    });

    // Add legend (top right)
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 350}, -10)`);

    const legendData = [
      { label: '🔵 Sequential', color: '#3498db', description: 'Normal queries' },
      { label: '🟠 Parallel', color: '#e67e22', description: 'Concurrent execution' },
      { label: '🟣 Transaction', color: '#9b59b6', description: 'Inside transaction' },
      { label: '🔴 Error', color: '#e74c3c', description: 'Query failed' }
    ];

    legendData.forEach((item, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(${i * 90}, 0)`);

      g.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', item.color)
        .attr('rx', 2);

      g.append('text')
        .attr('x', 18)
        .attr('y', 11)
        .style('font-size', '11px')
        .style('font-weight', '500')
        .style('fill', '#333')
        .text(item.label)
        .append('title')
        .text(item.description);
    });
  }

  truncatePath(path, maxLength) {
    if (path.length <= maxLength) return path;
    return path.substring(0, maxLength) + '...';
  }

  renderRequestsList(requests) {
    const container = document.getElementById('requests-container');
    container.innerHTML = '';

    if (requests.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No requests yet. Make some API calls to see query visualization.</p>';
      return;
    }

    requests.forEach((request) => {
      const card = this.createRequestCard(request);
      container.appendChild(card);
    });
  }

  createRequestCard(request) {
    const card = document.createElement('div');
    card.className = 'request-card';

    const stats = request.stats || {};
    const duration = request.duration || 0;
    const durationClass = duration > this.slowThreshold ? 'slow' : '';

    card.innerHTML = `
      <div class="request-header">
        <div style="display: flex; gap: 10px; align-items: center;">
          <span class="request-method ${request.method}">${request.method}</span>
          <span class="request-path">${request.routePath}</span>
        </div>
        <span class="request-duration ${durationClass}">${duration.toFixed(2)}ms</span>
      </div>
      <div class="query-summary">
        <span>📊 ${stats.totalQueries || 0} queries</span>
        <span>🟠 ${stats.parallelQueries || 0} parallel</span>
        <span>🔵 ${stats.sequentialQueries || 0} sequential</span>
        <span>🟣 ${stats.transactions || 0} transactions</span>
        ${stats.errors > 0 ? `<span style="color: #e74c3c;">🔴 ${stats.errors} errors</span>` : ''}
      </div>
      <div class="queries-timeline" data-request-id="${request.requestId}"></div>
    `;

    // Render query timeline
    const timeline = card.querySelector('.queries-timeline');
    this.renderQueryTimeline(timeline, request.queries || []);

    // Click handler to show details
    card.addEventListener('click', () => {
      this.showRequestDetails(request);
    });

    return card;
  }

  renderQueryTimeline(container, queries) {
    if (queries.length === 0) return;

    const maxDuration = Math.max(...queries.map(q => q.duration || 0));

    queries.forEach((query) => {
      const bar = document.createElement('div');
      bar.className = 'query-bar';

      if (query.error) {
        bar.classList.add('error');
      } else if (query.isTransaction) {
        bar.classList.add('transaction');
      } else if (query.parallelGroup !== null) {
        bar.classList.add('parallel');
      }

      const height = maxDuration > 0 ? ((query.duration || 0) / maxDuration * 100) : 10;
      bar.style.height = `${Math.max(height, 10)}%`;

      bar.title = `${query.sql.substring(0, 50)}... (${(query.duration || 0).toFixed(2)}ms)`;

      container.appendChild(bar);
    });
  }

  showRequestDetails(request) {
    const modal = document.getElementById('query-detail-modal');
    const modalBody = document.getElementById('modal-body');

    const stats = request.stats || {};

    let html = `
      <div class="query-detail-info">
        <div><strong>Request ID:</strong> ${request.requestId}</div>
        <div><strong>Method:</strong> ${request.method}</div>
        <div><strong>Route:</strong> ${request.routePath}</div>
        <div><strong>Status:</strong> ${request.statusCode || 'N/A'}</div>
        <div><strong>Duration:</strong> ${(request.duration || 0).toFixed(2)}ms</div>
        <div><strong>Total Queries:</strong> ${stats.totalQueries || 0}</div>
        <div><strong>Parallel Queries:</strong> ${stats.parallelQueries || 0}</div>
        <div><strong>Sequential Queries:</strong> ${stats.sequentialQueries || 0}</div>
        <div><strong>Transactions:</strong> ${stats.transactions || 0}</div>
        <div><strong>Avg Query Time:</strong> ${(stats.avgQueryTime || 0).toFixed(2)}ms</div>
      </div>

      <h4 style="margin: 20px 0 10px 0;">Queries (${(request.queries || []).length})</h4>
    `;

    (request.queries || []).forEach((query, index) => {
      const typeLabel = query.error ? '🔴 ERROR' :
                       query.isTransaction ? '🟣 TRANSACTION' :
                       query.parallelGroup !== null ? '🟠 PARALLEL' : '🔵 SEQUENTIAL';

      html += `
        <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e1e8ed;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <strong>Query #${index + 1}</strong>
            <span>${typeLabel}</span>
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
            Pool: ${query.pool} | Duration: ${(query.duration || 0).toFixed(2)}ms
            ${query.transactionId ? ` | TX: ${query.transactionId.substring(0, 8)}` : ''}
          </div>
          <div class="query-detail-sql">${this.formatSQL(query.sql)}</div>
          ${query.bindings && query.bindings.length > 0 ? `
            <div style="margin-top: 5px; font-size: 12px; color: #666;">
              Bindings: ${JSON.stringify(query.bindings)}
            </div>
          ` : ''}
          ${query.error ? `
            <div style="margin-top: 5px; padding: 10px; background: #ffe6e6; border-left: 4px solid #e74c3c; border-radius: 4px;">
              <strong>Error:</strong> ${query.error.message}<br>
              ${query.error.code ? `<strong>Code:</strong> ${query.error.code}` : ''}
            </div>
          ` : ''}
        </div>
      `;
    });

    modalBody.innerHTML = html;
    modal.style.display = 'flex';
  }

  formatSQL(sql) {
    // Basic SQL formatting - add line breaks for readability
    return sql
      .replace(/\s+/g, ' ')
      .replace(/SELECT /gi, 'SELECT\n  ')
      .replace(/FROM /gi, '\nFROM ')
      .replace(/WHERE /gi, '\nWHERE ')
      .replace(/AND /gi, '\n  AND ')
      .replace(/OR /gi, '\n  OR ')
      .replace(/ORDER BY /gi, '\nORDER BY ')
      .replace(/GROUP BY /gi, '\nGROUP BY ')
      .replace(/LIMIT /gi, '\nLIMIT ')
      .replace(/INNER JOIN /gi, '\nINNER JOIN ')
      .replace(/LEFT JOIN /gi, '\nLEFT JOIN ')
      .replace(/RIGHT JOIN /gi, '\nRIGHT JOIN ')
      .trim();
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Dashboard] Initializing...');
  window.dashboard = new QueryVizDashboard();
});
