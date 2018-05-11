const DATA_URL =  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json",
    request = new XMLHttpRequest(),
    mouse = {};

window.onmousemove = (e) => {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
};

request.open('GET', DATA_URL, true);
request.send();
request.onload = () => {
    const response = JSON.parse(request.response);
    render(response);
}

const render = response => {
    let margin = {top: 100, right: 100, bottom: 100, left: 100};

    const width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom,
        data = response.monthlyVariance,
        minYear = d3.min(data, d => d.year),
        maxYear = d3.max(data, d => d.year),
        item = {
            width: width / (maxYear - minYear),
            height: height / 12
        };

    const svg = d3.select('.container')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height);

    const xScale = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([1, 12])
        .range([margin.top, height - margin.bottom]);

    const xAxis = d3.axisBottom(xScale),
        yAxis =  d3.axisLeft(yScale);

    svg.append('g')
        .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
        .call(xAxis);

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxis);

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => margin.left + xScale(d.year))
        .attr('y', d => yScale(d.month))
        .attr('width', item.width)
        .attr('height', item.height)
        .attr('fill', 'red')
};