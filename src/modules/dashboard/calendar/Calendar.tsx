import React, { useCallback, useEffect, useRef, useState } from "react"
import TUICalendar from "@toast-ui/react-calendar"
import { ISchedule, ICalendarInfo } from "tui-calendar"
import "tui-calendar/dist/tui-calendar.css"
import "tui-date-picker/dist/tui-date-picker.css"
import "tui-time-picker/dist/tui-time-picker.css"
import Layout from "../../../components/layout/Layout"
import { Box, Button, Grid, makeStyles } from "@material-ui/core"
import { localRoutes, remoteRoutes } from "../../../data/constants"
import { get, put, del, post } from "../../../utils/ajax"
import Toast from "../../../utils/Toast"
import { useDispatch, useSelector } from "react-redux"
import { IState } from "../../../data/types"
import EditDialog from "../../../components/EditDialog"
import EventForm from "../../events/forms/EventForm"
import { eventsEdit, IEventState } from "../../../data/events/eventsReducer"
import { useHistory } from "react-router"
import { IEvent } from "../../events/types"
import AddIcon from "@material-ui/icons/Add"

const start = new Date()
const end = new Date(new Date().setMinutes(start.getMinutes() + 30))

const CalendarEvents = () => {
	const cal = useRef(null) // this will store the `Calendar` instance.
	const [dialog, setDialog] = useState(false)
	const [value, setValue] = useState<any[]>([])
	// const user = useSelector((state: IState) => state.core.user)
	const [schedules, setSchedules] = useState<any[]>([])
	const { selected, data }: IEventState = useSelector(
		(state: any) => state.events
	)
	const dispatch = useDispatch()
	const [selectedEvent, setSelectedEvent] = useState<Partial<IEvent>>({})
	const [events, setEvents] = useState<IEvent[]>([])
	const [isNew, setIsNew] = useState<boolean>(true)

	useEffect(() => {
		get(remoteRoutes.events, (data) => {
			console.log("====mydata===", data)
			setEvents(data)
			let myEvents: ISchedule[] = []

			for (let i = 0; i < data.length; i++) {
				const calEvent = {
					category: "time",
					isVisible: true,
					id: data[i].id,
					title: data[i].name,
					body: data[i].summary,
					group: data[i].group.name,
					location: data[i].venue.name,
					start: data[i].startDate,
					end: data[i].endDate,
				}
				myEvents.push(calEvent)
			}
			setSchedules(myEvents)
		})
	}, [])

	const onBeforeCreateSchedule = useCallback((scheduleData) => {
		setValue(scheduleData)

		setDialog(true)
	}, [])

	const onBeforeDeleteSchedule = useCallback((res) => {
		const { id, calendarId, title } = res.schedule

		cal.current.calendarInst.deleteSchedule(id, calendarId)
		del(`${remoteRoutes.events}/${id}`, (response) => {
			Toast.success(`${title} has been deleted successfully`)
		})
	}, [])

	const onBeforeUpdateSchedule = (e: any) => {
		setDialog(true)
		setIsNew(false)
		for (let i = 0; i < events.length; i++) {
			if (events[i].id === e.schedule.id) {
				console.log("====ourdata===", events[i])
				setSelectedEvent({ ...events[i] })
			}
		}
	}

	function handleNew() {
		setDialog(true)
	}

	function handleClose() {
		setDialog(false)
	}

	function handleEdited(dt: any) {
		setDialog(false)
		dispatch(eventsEdit(dt))
	}
	function handleCreated() {
		console.log("it worked")
		setDialog(false)

		setSchedules([])
	}

	function onClickTodayBtn() {
		cal.current.calendarInst.today()
	}

	const moveToPrev = () => {
		cal.current.calendarInst.prev()
	}
	const moveToNext = () => {
		cal.current.calendarInst.next()
	}

	return (
		<Layout>
			<Box p={2}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Button
							variant='outlined'
							color='primary'
							onClick={handleNew}
							startIcon={<AddIcon />}
							style={{ marginLeft: 8 }}
						>
							Create Event&nbsp;&nbsp;
						</Button>
						<EditDialog
							open={dialog}
							onClose={handleClose}
							title={isNew ? "Add Event" : "Edit Event"}
						>
							<EventForm
								data={selectedEvent}
								cal={cal}
								scheduleData={value}
								//e={eventdialog}
								isNew={isNew}
								onUpdated={handleEdited}
								onCancel={handleClose}
								onCreated={handleCreated}
							/>
						</EditDialog>
					</Grid>
					<Grid item xs={12}>
						<div>
							<div className='button'>
								<Button onClick={onClickTodayBtn}>Today</Button>
								<Button onClick={moveToPrev}>←</Button>
								<Button onClick={moveToNext}>→</Button>
							</div>

							<TUICalendar
								ref={cal}
								height='1000px'
								view='month'
								useCreationPopup={false}
								useDetailPopup={true}
								schedules={schedules}
								onBeforeCreateSchedule={onBeforeCreateSchedule}
								onBeforeDeleteSchedule={onBeforeDeleteSchedule}
								onBeforeUpdateSchedule={onBeforeUpdateSchedule}
							/>
						</div>
					</Grid>
				</Grid>
			</Box>
		</Layout>
	)
}

export default CalendarEvents
