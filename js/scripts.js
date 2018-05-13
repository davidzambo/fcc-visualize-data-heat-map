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
    window.addEventListener('resize', () => render(response));
};

const render = response => {
    let margin, width, height;
    if (window.innerWidth > 901) {
        margin = {top: 30 , right: 30, bottom: 80, left: 100};
        width = window.innerWidth - margin.left - margin.right;
        height = window.innerHeight - margin.top - margin.bottom - 100;
    } else if (window.innerWidth > 700) {
        margin = {top: 30, right: 30, bottom: 50, left: 80};
        width = window.innerWidth - margin.left - margin.right;
        height = window.innerHeight - margin.top - margin.bottom - 130;
    } else {
        margin = {top: 30, right: 30, bottom: 50, left: 80};
        width = window.innerWidth - margin.left / 4 - margin.right / 4;
        height = window.innerHeight - margin.top - margin.bottom - 150;
    }
    const {baseTemperature} = response,
        data = response.monthlyVariance,
        minYear = d3.min(data, d => d.year),
        maxYear = d3.max(data, d => d.year),
        minimumTemperature = parseInt(d3.min(data, d => baseTemperature + d.variance)*1000)/1000,
        maximumTemperature = parseInt(d3.max(data, d => baseTemperature + d.variance)*1000)/1000,
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        item = {
            width: Math.floor((width - margin.left - margin.right) / (maxYear - minYear)),
            height: Math.floor((height - margin.top - margin.bottom) /months.length)
        };

    // Helper functions
    const colorize = (temp, minTemp = minimumTemperature, maxTemp = maximumTemperature )=> {
        const colors = [
                "#7164AD",
                "#3F8FC1",
                "#66C2A5",
                "#ABDDA4",
                "#E6F598",
                "#FFFFBF",
                "#FEE292",
                "#FDAE61",
                "#F46D43",
                "#D84A5A",
                "#DC606E",
                "#A4104E"
            ],
            /**
             * Take the maxTemp and the minTemp,
             * add 100 to handle an absolute positive value
             * and divide it with the length of the colors array.
             * */
            scaleStep = ((maxTemp + 100) - (minTemp + 100)) / colors.length;
        /**
         * Substract the minTemp from the given temp to get the absolute temp value.
         * Then divide it with the scaleStep, to find out at which step will be the
         * actual color. We have to get the int value of it.
         * */
        return colors[parseInt((temp - minTemp) / scaleStep)];
    }

    const tempCalc = temp => {
        return parseInt((baseTemperature + temp) * 1000)/1000;
    };

    d3.select('.container').html('');
    d3.select('.container').append('h1').text('Monthly Global Land-Surface Temperature');
    d3.select('.container').append('p').text('Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average.');
    d3.select('.container').append('p').text('Estimated Jan 1951-Dec 1980 absolute temperature ℃: 8.66 +/- 0.07');
    d3.select('.container').append('div').html('<div id="tooltip" class="hidden">\n' +
        '        <p><strong>Date: </strong><span id="date"></span></p>\n' +
        '        <p><strong>Temperature: </strong><span id="temperature"></span></p>\n' +
        '    </div>');


    const svg = d3.select('.container')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const xScale = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([0, width - margin.right - margin.left]);

    const yScale = d3.scaleLinear()
        .domain([1, 13])
        .range([margin.top, height - margin.bottom]);

    const xAxis = d3.axisBottom(xScale),
        yAxis =  d3.axisLeft(yScale)
            // .ticks(months);
            .tickFormat( (d,i) => months[i - 1]);

    svg.append('g')
        .attr('class', 'yAxis')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxis);

    svg.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', 0 - height / 2)
        .attr('y', margin.left / 3)
        .text('Months');

    svg.append('g')
        .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
        .call(xAxis);

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - margin.bottom / 3)
        .text('Years');

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => margin.left + 1 + xScale(d.year))
        .attr('y', d => yScale(d.month))
        .attr('width', item.width)
        .attr('height', item.height)
        .attr('fill', d => colorize(tempCalc(d.variance)))
        .on('mousemove', function(d){
            d3.select('#date').text(`${d.year}. ${months[d.month - 1]}`);
            d3.select('#temperature').text(tempCalc((d.variance)) + " C");
            d3.select('#tooltip')
                .style('left', (mouse.x - 80) + 'px')
                .style('top', (mouse.y - 70) + 'px')
                .classed('hidden', false);
        }
    );

    svg.selectAll('.yAxis .tick text').attr('dy', - ((height - margin.top - margin.bottom ) / 12 / 2));
    svg.selectAll('.yAxis .tick line').remove();

    d3.select('.container')
        .append('footer')
        .html('<a href="https://www.dcmf.hu" target="_blank"><span>codedBy</span><img src="https://www.dcmf.hu/images/dcmf-letters.png" alt="dcmf-logo" /></a>');

};