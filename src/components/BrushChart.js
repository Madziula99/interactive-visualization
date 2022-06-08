import React, { useEffect, useRef, useState } from "react";

import { select, axisBottom, scaleLinear, axisLeft } from 'd3';

const useResizeObserver = ref => {
  const [dimensions, setDimensions] = useState(null);
  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        setDimensions(entry.contentRect)
      })
    });
    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
    }
  }, [ref]);
  return dimensions;
}

function BrushChart({ songs, selection }) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);

    useEffect( () => {
      const svg = select(svgRef.current);
      const content = svg.select('.content');

      if(!dimensions) return

      //scales
      const xScale = scaleLinear()
        .domain(selection)
        .range([4, dimensions.width-4]);
      const yScale = scaleLinear()
        .domain([0, 100])
        .range([dimensions.height-4, 2]);

      //scale axis lines
      const xAxis = axisBottom(xScale)
        .tickFormat(d => d);
      const yAxis = axisLeft(yScale);

      //position axis lines
      svg
        .select(".x-axis")
        .style('transform', `translateY(${dimensions.height}px)`)
        .call(xAxis);

      svg
        .select(".y-axis")
        .call(yAxis);

      svg
        .select('.x-label')
        .selectAll('text')
        .attr('y', -30)
        .attr('x', -dimensions.height/2)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr("fill", "white")
        .attr("font-size", "13px")
        .text('Popularity');

      svg
        .select('.y-label')
        .selectAll("text")
        .attr("font-size", "13px")
        .attr("fill", "white")
        .attr("transform",
              "translate(" + (dimensions.width/2) + " ," +
                            (dimensions.height + 30) + ")")
        .style("text-anchor", "middle")
        .text("Years");

      //dots
      content
        .selectAll('circle')
        .data(songs)
        .join('circle')
        .attr('r', 3)
        .attr('stroke', 'red')
        .attr('cx', value => xScale(Number(value.album.release_date.slice(0, 4))))
        .attr('cy', value => yScale(value.popularity))
        .attr('fill', '#191414')
        .on('mouseenter', value => {
          svg
            .selectAll(".songInfo")
            .data([value])
            .join(enter => enter.append('text').attr('y', 0))
            .attr('class', 'songInfo')
            .attr("stroke-width",1)
            .attr("fill", "#198754")
            .attr("font-size", "13px")
            .attr('x', dimensions.width/2)
            .attr('text-anchor', 'middle')
            .text(value.target.__data__.name + ' - ' + value.target.__data__.artists[0].name)
            .transition()
            .attr('y', -5)
            .attr('opacity', 1);
        })
        .on('mouseleave', () => svg.selectAll('.songInfo').remove())
      }, [songs, dimensions, selection]);

    return (
      <React.Fragment>
        <div className='wrapper mt-5' ref={wrapperRef}>
          <svg id='chart' ref={svgRef}>
            <defs>
              <clipPath id='content-box'>
                <rect x='0' y='0' width='100%' height='100%' />
              </clipPath>
            </defs>
            <g className="content" clipPath="url(#content-box)" />
            <g className='x-axis' />
            <g className='x-label' >
              <text></text>
            </g>
            <g className='y-axis' />
            <g className='y-label' >
              <text></text>
            </g>
          </svg>
        </div>
      </React.Fragment>
    )
}

export default BrushChart;