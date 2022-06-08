import React, { useEffect, useRef, useState } from "react";

import './SongCharts.css';

import { select, axisBottom, scaleLinear, axisLeft, brushX } from 'd3';
import usePrevious from "./usePrevious";

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

function SongsChart({ songs, children }) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);

    const [selection, setSelection] = useState([0, 0]);
    const previousSelection = usePrevious(selection);

    useEffect( () => {
      const svg = select(svgRef.current);

      var currentYears = [];

      songs.map(song => (
        currentYears.push(Number(song.album.release_date.slice(0, 4)))
      ))

      if(!dimensions) return

      //scales
      const xScale = scaleLinear()
        .domain([Math.min(...currentYears), Math.max(...currentYears)])
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

      //label axis
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
      svg
        .selectAll('circle')
        .data(songs)
        .join('circle')
        .attr('r', song =>
          (Number(song.album.release_date.slice(0, 4)) >= selection[0])
          && (Number(song.album.release_date.slice(0, 4)) <= selection[1])
          ? 3
          : 2
        )
        .attr('stroke', song =>
          (Number(song.album.release_date.slice(0, 4)) >= selection[0])
          && (Number(song.album.release_date.slice(0, 4)) <= selection[1])
          ? 'red'
          : '#191414'
        )
        .attr('cx', song => xScale(Number(song.album.release_date.slice(0, 4))))
        .attr('cy', song => yScale(song.popularity))
        .attr('fill', '#191414')
        .on('mouseenter', song => {
          svg
            .selectAll(".songInfo")
            .data([song])
            .join(enter => enter.append('text').attr('y', 0))
            .attr('class', 'songInfo')
            .attr("fill", "#198754")
            .attr("font-size", "13px")
            .attr('x', dimensions.width/2)
            .attr('text-anchor', 'middle')
            .text(song.target.__data__.name + ' - ' + song.target.__data__.artists[0].name)
            .transition()
            .attr('y', -5)
            .attr('opacity', 1)
        })
        .on('mouseleave', () => svg.selectAll('.songInfo').remove());

        //brush
        const brush = brushX()
          .extent([
            [0, 0],
            [dimensions.width, dimensions.height]
          ])
          .on('start brush end', (e) => {
            if(!e.selection) return
            const indexSelection = e.selection.map(xScale.invert);
            setSelection(indexSelection)
          });

        if(previousSelection === selection) {
          if(selection[0] < Math.min(...currentYears) || selection[1] > Math.max(...currentYears)) {
            setSelection([Math.min(...currentYears), Math.min(...currentYears)+((Math.max(...currentYears)-Math.min(...currentYears))/5)]);
          }
          svg
            .select('.brush')
            .call(brush)
            .call(brush.move, selection.map(xScale));
        }
      }, [songs, dimensions, selection, previousSelection]);

    return (
      <React.Fragment>
        <div className='wrapper mb-5' ref={wrapperRef}>
          <svg id='chart' ref={svgRef} >
          <defs>
              <clipPath id='brush-box'>
                <rect x='0' y='0' width='100%' height='100%' />
              </clipPath>
            </defs>
            <g className='x-axis' />
            <g className='x-label' >
              <text></text>
            </g>
            <g className='y-axis' />
            <g className='y-label' >
              <text></text>
            </g>
            <g className="brush" clipPath="url(#brush-box)" />
          </svg>
        </div>
        {children(selection)}
      </React.Fragment>
    )
}

export default SongsChart;